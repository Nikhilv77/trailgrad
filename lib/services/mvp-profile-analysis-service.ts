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
import {
  claimAnalysisJobForRun,
  completeAnalysisJob,
  failAnalysisJob,
  persistAnalysisJobProgress,
} from "@/lib/services/analysis-job-service";
import { markOnboardingFailed } from "@/lib/services/profile-service";
import {
  getExperienceLevelLabel,
  getPreparationIntensityLabel,
  getPreparationTimeLabel,
  getTargetRoleLabel,
} from "@/lib/trails/catalog";

export interface MVPProfileAnalysisRunResult {
  profileAnalysis: ProfileAnalysisRecord | null;
  executed: boolean;
  reason: "completed" | "duplicate_completed" | "already_active_or_terminal";
}

class MVPProfileAnalysisError extends Error {
  constructor(
    readonly code:
      | "PROFILE_ANALYSIS_INPUT_MISSING"
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
      targetContextId: claimedJob.targetContextId,
    });

    if (!context) {
      throw new MVPProfileAnalysisError(
        "PROFILE_ANALYSIS_INPUT_MISSING",
        "No extracted resume text is available for analysis.",
      );
    }

    profileAnalysis = await reserveProfileAnalysisRecord({
      profileId: context.profileId,
      resumeVersionId: context.resumeVersion.id,
      targetContextId: context.targetContext?.id ?? null,
      promptVersion: mvpProfileAnalysisPromptVersion,
    });

    if (profileAnalysis.status === "COMPLETED") {
      await completeAnalysisJob(claimedJob.id);

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

    if (claimedJob.type === "INITIAL_PROFILE") {
      await markOnboardingFailed(claimedJob.profileId, safeError.message).catch(
        () => undefined,
      );
    }

    throw safeError;
  }
}

function buildMVPAnalysisPromptContent(context: MVPAnalysisInputContext) {
  return [
    "Analyze this Trailgrad onboarding profile. Return only the requested JSON object.",
    "",
    "Trail setup context:",
    JSON.stringify(buildCompactTargetContext(context)),
    "",
    "Compact resume evidence packet with original line numbers:",
    buildCompactResumeEvidencePacket(context.resumeVersion.extractedText),
  ].join("\n");
}

function buildCompactTargetContext(context: MVPAnalysisInputContext) {
  const trailFocus = context.targetContext?.trailFocus ?? "job";
  const targetRoleId =
    context.targetContext?.role ?? context.careerContext?.primaryTargetRole ?? null;
  const experienceLevelId = context.careerContext?.experienceLevel ?? null;
  const targetDetail = context.targetContext?.jobDescription
    ? truncateText(context.targetContext.jobDescription, 2_500)
    : null;
  const preparationTimeId = getPreparationTimeId(context);
  const timeline = context.careerContext?.noDateYet
    ? {
        kind: "flexible",
        label: "Flexible / no date yet",
        targetDate: null,
      }
    : {
        kind: "dated",
        label: context.careerContext?.interviewOrApplicationDate
          ? `By ${context.careerContext.interviewOrApplicationDate}`
          : "Date not provided",
        targetDate: context.careerContext?.interviewOrApplicationDate ?? null,
      };

  return {
    trailFocus,
    targetRole: {
      id: targetRoleId,
      label: getTargetRoleLabel(targetRoleId),
    },
    experienceLevel: {
      id: experienceLevelId,
      label: getExperienceLevelLabel(experienceLevelId),
    },
    selectedGoal: {
      label: context.targetContext?.jobTitle ?? null,
      companyOrTopic: context.targetContext?.company ?? null,
      hasSpecificCompanyOrTopic: Boolean(context.targetContext?.company),
    },
    schedule: {
      timeline,
      weeklyTime: {
        id: preparationTimeId,
        label: getPreparationTimeLabel(preparationTimeId),
        dailyMinutes: context.careerContext?.dailyPreparationMinutes ?? null,
        flexible: Boolean(context.careerContext?.flexiblePreparationTime),
      },
      intensity: {
        id: context.careerContext?.preparationIntensity ?? null,
        label: getPreparationIntensityLabel(
          context.careerContext?.preparationIntensity,
        ),
      },
    },
    targetDetails: targetDetail
      ? {
          provided: true,
          kind: trailFocus === "learning" ? "learning_context" : "job_description",
          text: targetDetail,
        }
      : {
          provided: false,
          kind: trailFocus === "learning" ? "learning_context" : "job_description",
        },
    responsePriorities: [
      "highest-impact rejection risks",
      "evidence gaps the resume can realistically fix",
      "questions likely for this role and goal",
      "one next action sized to the prep rhythm",
    ],
  };
}

function getPreparationTimeId(context: MVPAnalysisInputContext) {
  if (context.careerContext?.flexiblePreparationTime) {
    return "flexible";
  }

  const minutes = context.careerContext?.dailyPreparationMinutes;

  if (minutes === 15 || minutes === 30 || minutes === 60) {
    return String(minutes);
  }

  return null;
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
