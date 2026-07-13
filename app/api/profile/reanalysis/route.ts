import { auth } from "@clerk/nextjs/server";
import { z, ZodError } from "zod";

import {
  createProfileAnalysisRequestedEvent,
  inngest,
} from "@/lib/inngest/client";
import { findAnalysisJobByIdRecord } from "@/lib/db/analysis-job-repository";
import { findLatestCompletedProfileAnalysisRecord } from "@/lib/db/profile-analysis-repository";
import { buildAnalysisInputFingerprint } from "@/lib/onboarding/analysis-input-fingerprint";
import {
  getOnboardingState,
  listResumeVersions,
  markOnboardingCompleted,
} from "@/lib/services/profile-service";
import {
  buildAnalysisJobIdempotencyKey,
  requestAnalysisJob,
} from "@/lib/services/analysis-job-service";
import {
  OnboardingSubmissionSchema,
  onboardingTargetRoles,
} from "@/lib/validators/profile";

const ReanalysisRequestSchema = z.object({
  targetRole: z.enum(onboardingTargetRoles, {
    message: "Choose a supported target role.",
  }),
  targetCompany: z.string().trim().max(120).optional(),
  targetJobTitle: z.string().trim().max(120).optional(),
  targetJobMode: z.enum(["paste", "skip"]),
  jobDescription: z.string().trim().max(12_000).optional(),
  preparationTimePerDay: z.enum(["15", "30", "60", "flexible"]),
  preparationIntensity: z.enum(["light", "standard", "intensive"]),
});

class ReanalysisError extends Error {
  constructor(
    readonly code:
      | "AUTHENTICATION_REQUIRED"
      | "ONBOARDING_NOT_COMPLETE"
      | "REANALYSIS_INVALID_INPUT"
      | "REANALYSIS_JOB_NOT_FOUND"
      | "RESUME_NOT_READY"
      | "ANALYSIS_QUEUE_UNAVAILABLE",
    message: string,
  ) {
    super(message);
    this.name = "ReanalysisError";
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new ReanalysisError(
        "AUTHENTICATION_REQUIRED",
        "Authentication required.",
      );
    }

    const jobId = new URL(request.url).searchParams.get("jobId");

    if (!jobId) {
      throw new ReanalysisError(
        "REANALYSIS_INVALID_INPUT",
        "Missing reanalysis job id.",
      );
    }

    const job = await findAnalysisJobByIdRecord(jobId);

    if (!job || job.profileId !== userId) {
      throw new ReanalysisError(
        "REANALYSIS_JOB_NOT_FOUND",
        "Reanalysis job not found.",
      );
    }

    const latestAnalysis =
      job.status === "COMPLETED"
        ? await findLatestCompletedProfileAnalysisRecord(userId)
        : null;

    return Response.json({
      job: {
        id: job.id,
        status: job.status,
        currentStage: job.currentStage,
        progressPercent: job.progressPercent,
        safeErrorMessage: job.safeErrorMessage,
        completedAt: job.completedAt,
      },
      latestAnalysisUpdatedAt: latestAnalysis?.updatedAt ?? null,
    });
  } catch (error) {
    const safeError = getSafeReanalysisError(error);

    return Response.json(
      {
        code: safeError.code,
        error: safeError.message,
      },
      { status: getStatusCode(safeError.code) },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new ReanalysisError(
        "AUTHENTICATION_REQUIRED",
        "Authentication required.",
      );
    }

    const input = ReanalysisRequestSchema.parse(await request.json());

    if (input.targetJobMode === "paste" && !input.jobDescription?.trim()) {
      throw new ReanalysisError(
        "REANALYSIS_INVALID_INPUT",
        "Paste a job description or choose to skip the target job.",
      );
    }

    const state = await getOnboardingState(userId);
    const existing = OnboardingSubmissionSchema.safeParse(state.onboarding);

    if (state.status !== "completed" || !existing.success) {
      throw new ReanalysisError(
        "ONBOARDING_NOT_COMPLETE",
        "Complete onboarding before updating your analysis.",
      );
    }

    const resumeVersion = (await listResumeVersions(userId)).find(
      (version) => version.active && version.extractedTextStatus === "EXTRACTED",
    );

    if (!resumeVersion) {
      throw new ReanalysisError(
        "RESUME_NOT_READY",
        "Upload a resume before updating your analysis.",
      );
    }

    const onboarding = OnboardingSubmissionSchema.parse({
      ...existing.data,
      targetRole: input.targetRole,
      targetCompany: input.targetCompany,
      targetJobTitle: input.targetJobTitle,
      targetJobMode: input.targetJobMode,
      jobDescription:
        input.targetJobMode === "paste" ? input.jobDescription : undefined,
      preparationTimePerDay: input.preparationTimePerDay,
      preparationIntensity: input.preparationIntensity,
    });

    await markOnboardingCompleted(userId, onboarding);

    const inputFingerprint = buildAnalysisInputFingerprint(onboarding);
    const idempotencyKey = buildAnalysisJobIdempotencyKey({
      inputFingerprint,
      profileId: userId,
      sourceDocumentId: resumeVersion.sourceDocumentId,
      type: "JOB_ANALYSIS",
    });
    const reservation = await requestAnalysisJob({
      profileId: userId,
      sourceDocumentId: resumeVersion.sourceDocumentId,
      type: "JOB_ANALYSIS",
      idempotencyKey,
    });

    try {
      await inngest.send(
        createProfileAnalysisRequestedEvent({
          profileId: userId,
          sourceDocumentId: resumeVersion.sourceDocumentId,
          type: "JOB_ANALYSIS",
          idempotencyKey,
          eventId: reservation.duplicate
            ? `${idempotencyKey}:retry:${reservation.job.attemptCount + 1}:${Date.now()}`
            : idempotencyKey,
        }),
      );
    } catch {
      throw new ReanalysisError(
        "ANALYSIS_QUEUE_UNAVAILABLE",
        "Trailgrad saved your target, but could not queue the reanalysis. For local development, run the Inngest dev server and set INNGEST_DEV=1.",
      );
    }

    return Response.json({
      analysisJobId: reservation.job.id,
      duplicate: reservation.duplicate,
      status: "queued",
    });
  } catch (error) {
    const safeError = getSafeReanalysisError(error);

    return Response.json(
      {
        code: safeError.code,
        error: safeError.message,
      },
      { status: getStatusCode(safeError.code) },
    );
  }
}

function getSafeReanalysisError(error: unknown) {
  if (error instanceof ZodError) {
    return {
      code: "REANALYSIS_INVALID_INPUT" as const,
      message: error.issues[0]?.message ?? "Invalid reanalysis payload.",
    };
  }

  if (error instanceof ReanalysisError) {
    return {
      code: error.code,
      message: error.message,
    };
  }

  return {
    code: "ANALYSIS_QUEUE_UNAVAILABLE" as const,
    message: "Trailgrad could not queue the reanalysis.",
  };
}

function getStatusCode(code: ReturnType<typeof getSafeReanalysisError>["code"]) {
  if (code === "AUTHENTICATION_REQUIRED") return 401;
  if (code === "ONBOARDING_NOT_COMPLETE") return 409;
  if (code === "REANALYSIS_JOB_NOT_FOUND") return 404;
  if (code === "RESUME_NOT_READY") return 409;
  if (code === "REANALYSIS_INVALID_INPUT") return 400;
  return 500;
}
