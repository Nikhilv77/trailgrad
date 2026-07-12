import { getAIConfiguration } from "@/lib/ai/configuration";
import { assertAIDataPolicyAllowsContent } from "@/lib/ai/data-policy";
import { toSafeAIError } from "@/lib/ai/errors";
import {
  mvpProfileAnalysisPromptVersion,
  mvpProfileAnalysisSystemInstruction,
} from "@/lib/ai/prompts/mvp-analysis";
import { getAIProvider } from "@/lib/ai/provider-factory";
import {
  mvpAnalysisSchema,
} from "@/lib/ai/schemas/mvp-analysis";
import { findAnalysisJobByIdRecord } from "@/lib/db/analysis-job-repository";
import {
  completeProfileAnalysisRecord,
  failProfileAnalysisRecord,
  loadMVPAnalysisInputContextRecord,
  reserveProfileAnalysisRecord,
  type MVPAnalysisInputContext,
  type ProfileAnalysisRecord,
} from "@/lib/db/profile-analysis-repository";
import type { OnboardingSubmission } from "@/lib/onboarding/types";
import {
  claimAnalysisJobForRun,
  completeAnalysisJob,
  failAnalysisJob,
  persistAnalysisJobProgress,
} from "@/lib/services/analysis-job-service";
import {
  markOnboardingCompleted,
  markOnboardingFailed,
} from "@/lib/services/profile-service";
import { OnboardingSubmissionSchema } from "@/lib/validators/profile";

export interface MVPProfileAnalysisRunResult {
  profileAnalysis: ProfileAnalysisRecord | null;
  executed: boolean;
  reason: "completed" | "duplicate_completed" | "already_active_or_terminal";
}

class MVPProfileAnalysisError extends Error {
  constructor(
    readonly code:
      | "PROFILE_ANALYSIS_INPUT_MISSING"
      | "PROFILE_ANALYSIS_INVALID_ONBOARDING"
      | "PROFILE_ANALYSIS_FAILED",
    message: string,
  ) {
    super(message);
    this.name = "MVPProfileAnalysisError";
  }
}

export async function runMVPProfileAnalysisJob(
  jobId: string,
): Promise<MVPProfileAnalysisRunResult> {
  const loadedJob = await findAnalysisJobByIdRecord(jobId);

  if (!loadedJob) {
    throw new MVPProfileAnalysisError(
      "PROFILE_ANALYSIS_INPUT_MISSING",
      "Analysis job not found.",
    );
  }

  const claimedJob = await claimAnalysisJobForRun(jobId);

  if (!claimedJob) {
    const currentJob = await findAnalysisJobByIdRecord(jobId);

    return {
      profileAnalysis: null,
      executed: false,
      reason:
        currentJob?.status === "COMPLETED"
          ? "duplicate_completed"
          : "already_active_or_terminal",
    };
  }

  let profileAnalysis: ProfileAnalysisRecord | null = null;
  let providerName: string | undefined;
  let modelName: string | undefined;

  try {
    await persistAnalysisJobProgress(claimedJob.id, "resume_analysis");
    const context = await loadMVPAnalysisInputContextRecord({
      profileId: claimedJob.profileId,
      sourceDocumentId: claimedJob.sourceDocumentId,
    });

    if (!context) {
      throw new MVPProfileAnalysisError(
        "PROFILE_ANALYSIS_INPUT_MISSING",
        "No extracted resume text is available for analysis.",
      );
    }

    const onboarding = parseStoredOnboarding(context.onboarding);
    profileAnalysis = await reserveProfileAnalysisRecord({
      profileId: context.profileId,
      resumeVersionId: context.resumeVersion.id,
      targetContextId: context.targetContext?.id ?? null,
      promptVersion: mvpProfileAnalysisPromptVersion,
    });

    if (profileAnalysis.status === "COMPLETED") {
      await completeAnalysisJob(claimedJob.id);
      await markOnboardingCompleted(claimedJob.profileId, onboarding);

      return {
        profileAnalysis,
        executed: false,
        reason: "duplicate_completed",
      };
    }

    await persistAnalysisJobProgress(claimedJob.id, "target_analysis");
    const content = buildMVPAnalysisPromptContent(context);
    assertAIDataPolicyAllowsContent({
      configuration: getAIConfiguration(),
      content,
    });

    await persistAnalysisJobProgress(claimedJob.id, "profile_reconciliation");
    const result = await getAIProvider().generateStructured({
      operation: "mvp_profile_analysis",
      systemInstruction: mvpProfileAnalysisSystemInstruction,
      content,
      schema: mvpAnalysisSchema,
      schemaName: "MVPAnalysis",
      modelClass: "analysis",
      promptVersion: mvpProfileAnalysisPromptVersion,
      profileId: claimedJob.profileId,
      analysisJobId: claimedJob.id,
    });
    providerName = result.provider;
    modelName = result.model;

    await persistAnalysisJobProgress(claimedJob.id, "risk_generation");
    const validated = mvpAnalysisSchema.parse(result.data);

    await persistAnalysisJobProgress(claimedJob.id, "sprint_generation");
    const completedProfileAnalysis = await completeProfileAnalysisRecord({
      id: profileAnalysis.id,
      result: validated,
      provider: result.provider,
      model: result.model,
      promptVersion: mvpProfileAnalysisPromptVersion,
    });

    await persistAnalysisJobProgress(claimedJob.id, "question_generation");
    await persistAnalysisJobProgress(claimedJob.id, "finalization");
    await completeAnalysisJob(claimedJob.id);
    await markOnboardingCompleted(claimedJob.profileId, onboarding);

    return {
      profileAnalysis: completedProfileAnalysis,
      executed: true,
      reason: "completed",
    };
  } catch (error) {
    const safeError = toSafeWorkflowError(error);

    if (profileAnalysis) {
      await failProfileAnalysisRecord({
        id: profileAnalysis.id,
        provider: providerName,
        model: modelName,
        safeErrorCode: safeError.code,
      }).catch(() => undefined);
    }

    await failAnalysisJob(claimedJob.id, safeError).catch(() => undefined);
    await markOnboardingFailed(claimedJob.profileId, safeError.message).catch(
      () => undefined,
    );
    throw safeError;
  }
}

function parseStoredOnboarding(value: unknown): OnboardingSubmission {
  const parsed = OnboardingSubmissionSchema.safeParse(value);

  if (!parsed.success) {
    throw new MVPProfileAnalysisError(
      "PROFILE_ANALYSIS_INVALID_ONBOARDING",
      "Stored onboarding data is incomplete.",
    );
  }

  return parsed.data;
}

function buildMVPAnalysisPromptContent(context: MVPAnalysisInputContext) {
  return [
    "Analyze this Trailgrad onboarding profile. Return only the requested JSON object.",
    "",
    "Target context:",
    JSON.stringify(buildCompactTargetContext(context)),
    "",
    "Compact resume evidence packet with original line numbers:",
    buildCompactResumeEvidencePacket(context.resumeVersion.extractedText),
  ].join("\n");
}

function buildCompactTargetContext(context: MVPAnalysisInputContext) {
  return {
    targetRole: context.careerContext?.primaryTargetRole ?? null,
    experienceLevel: context.careerContext?.experienceLevel ?? null,
    targetCompany: context.targetContext?.company ?? null,
    targetJobTitle: context.targetContext?.jobTitle ?? null,
    timeline: context.careerContext?.noDateYet
      ? "no_date_yet"
      : context.careerContext?.interviewOrApplicationDate,
    dailyPreparationMinutes: context.careerContext?.dailyPreparationMinutes ?? null,
    preparationIntensity: context.careerContext?.preparationIntensity ?? null,
    jobDescription: context.targetContext?.jobDescription
      ? truncateText(context.targetContext.jobDescription, 2_500)
      : null,
  };
}

function buildCompactResumeEvidencePacket(text: string) {
  const allLines = text
    .split(/\r?\n/)
    .map((line, index) => ({
      number: index + 1,
      text: line.replace(/\s+/g, " ").trim(),
    }))
    .filter((line) => line.text.length > 0);

  const selected = new Map<number, string>();

  for (const line of allLines.slice(0, 24)) {
    selected.set(line.number, truncateText(line.text, 220));
  }

  for (const line of allLines) {
    if (selected.size >= 90) {
      break;
    }

    if (isLikelyResumeEvidenceLine(line.text)) {
      selected.set(line.number, truncateText(line.text, 220));
    }
  }

  for (const line of allLines.slice(-12)) {
    if (selected.size >= 90) {
      break;
    }

    selected.set(line.number, truncateText(line.text, 220));
  }

  return Array.from(selected.entries())
    .sort((first, second) => first[0] - second[0])
    .map(([number, line]) => `${number}: ${line}`)
    .join("\n");
}

function isLikelyResumeEvidenceLine(line: string) {
  return /experience|project|skill|education|certification|achievement|award|intern|engineer|developer|analyst|manager|built|created|designed|implemented|improved|optimized|led|owned|launched|python|typescript|javascript|react|node|sql|postgres|aws|gcp|azure|llm|ml|ai/i.test(
    line,
  );
}

function truncateText(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

function toSafeWorkflowError(error: unknown) {
  const aiError = toSafeAIError(error);

  if (aiError.code !== "UNKNOWN_PROVIDER_ERROR") {
    return aiError;
  }

  if (error instanceof MVPProfileAnalysisError) {
    return {
      code: error.code,
      message: error.message,
    };
  }

  return {
    code: "PROFILE_ANALYSIS_FAILED",
    message: "Trailgrad could not complete the profile analysis.",
  };
}

export const mvpProfileAnalysisTestInternals = {
  buildMVPAnalysisPromptContent,
  buildCompactResumeEvidencePacket,
};
