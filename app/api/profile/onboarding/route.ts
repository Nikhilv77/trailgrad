import { auth } from "@clerk/nextjs/server";
import { ZodError } from "zod";

import {
  createProfileAnalysisRequestedEvent,
  inngest,
} from "@/lib/inngest/client";
import {
  listResumeVersions,
  markOnboardingAnalyzing,
  markOnboardingFailed,
  updateOnboardingStep,
} from "@/lib/services/profile-service";
import {
  buildAnalysisJobIdempotencyKey,
  requestAnalysisJob,
} from "@/lib/services/analysis-job-service";
import { getReconciledOnboardingState } from "@/lib/services/onboarding-analysis-status-service";
import {
  OnboardingStepUpdateSchema,
  OnboardingSubmissionSchema,
} from "@/lib/validators/profile";

class OnboardingSubmissionError extends Error {
  constructor(
    readonly code:
      | "RESUME_NOT_READY"
      | "ANALYSIS_QUEUE_UNAVAILABLE"
      | "ONBOARDING_SAVE_FAILED",
    message: string,
  ) {
    super(message);
    this.name = "OnboardingSubmissionError";
  }
}

async function requireUserId() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  return userId;
}

export async function GET() {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return Response.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    return Response.json(await getReconciledOnboardingState(userId));
  } catch {
    return Response.json(
      { error: "Unable to load onboarding state." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return Response.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const input = OnboardingStepUpdateSchema.parse(await request.json());
    const profile = await updateOnboardingStep(
      userId,
      input.currentStep,
      input.onboarding,
    );

    return Response.json({
      status: profile.onboardingStatus,
      currentStep: profile.currentOnboardingStep,
      startedAt: profile.onboardingStartedAt,
      completedAt: profile.onboardingCompletedAt,
      analysisError: profile.analysisError,
      onboarding: profile.onboarding,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "Invalid onboarding payload." },
        { status: 400 },
      );
    }

    return Response.json(
      { error: "Unable to save onboarding step." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let userId: string | null = null;

  try {
    userId = await requireUserId();

    if (!userId) {
      return Response.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const input = OnboardingSubmissionSchema.parse(await request.json());
    const profile = await markOnboardingAnalyzing(userId, input);
    const resumeVersion = (await listResumeVersions(userId)).find(
      (version) => version.active && version.extractedTextStatus === "EXTRACTED",
    );

    if (!resumeVersion) {
      throw new OnboardingSubmissionError(
        "RESUME_NOT_READY",
        "Resume text is not ready for analysis. Upload your resume again or wait for extraction to finish.",
      );
    }

    const idempotencyKey = buildAnalysisJobIdempotencyKey({
      profileId: userId,
      sourceDocumentId: resumeVersion.sourceDocumentId,
      type: "INITIAL_PROFILE",
    });
    const reservation = await requestAnalysisJob({
      profileId: userId,
      sourceDocumentId: resumeVersion.sourceDocumentId,
      type: "INITIAL_PROFILE",
      idempotencyKey,
    });

    await sendProfileAnalysisEvent({
      profileId: userId,
      sourceDocumentId: resumeVersion.sourceDocumentId,
      idempotencyKey,
      duplicateJob: reservation.duplicate,
      attemptCount: reservation.job.attemptCount,
    });

    return Response.json({
      status: profile.onboardingStatus,
      currentStep: profile.currentOnboardingStep,
      startedAt: profile.onboardingStartedAt,
      completedAt: profile.onboardingCompletedAt,
      analysisError: profile.analysisError,
      onboarding: profile.onboarding,
      analysisJobId: reservation.job.id,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "Invalid onboarding payload." },
        { status: 400 },
      );
    }

    if (userId) {
      await markOnboardingFailed(
        userId,
        getSafeOnboardingSubmissionError(error).message,
      ).catch(() => undefined);
    }

    const safeError = getSafeOnboardingSubmissionError(error);

    return Response.json(
      {
        code: safeError.code,
        error: safeError.message,
      },
      { status: safeError.code === "RESUME_NOT_READY" ? 409 : 500 },
    );
  }
}

async function sendProfileAnalysisEvent(input: {
  profileId: string;
  sourceDocumentId: string;
  idempotencyKey: string;
  duplicateJob: boolean;
  attemptCount: number;
}) {
  try {
    await inngest.send(
      createProfileAnalysisRequestedEvent({
        profileId: input.profileId,
        sourceDocumentId: input.sourceDocumentId,
        type: "INITIAL_PROFILE",
        idempotencyKey: input.idempotencyKey,
        eventId: input.duplicateJob
          ? `${input.idempotencyKey}:retry:${input.attemptCount + 1}:${Date.now()}`
          : input.idempotencyKey,
      }),
    );
  } catch {
    throw new OnboardingSubmissionError(
      "ANALYSIS_QUEUE_UNAVAILABLE",
      "Trailgrad saved your onboarding data, but could not queue the analysis job. For local development, run the Inngest dev server and set INNGEST_DEV=1.",
    );
  }
}

function getSafeOnboardingSubmissionError(error: unknown) {
  if (error instanceof OnboardingSubmissionError) {
    return {
      code: error.code,
      message: error.message,
    };
  }

  return {
    code: "ONBOARDING_SAVE_FAILED" as const,
    message: "Unable to save onboarding.",
  };
}
