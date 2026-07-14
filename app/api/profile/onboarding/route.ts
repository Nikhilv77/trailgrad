import { auth } from "@clerk/nextjs/server";
import { ZodError } from "zod";

import type { OnboardingSubmission } from "@/lib/onboarding/types";
import {
  listSourceDocuments,
  listResumeVersions,
  markOnboardingCompleted,
  updateOnboardingStep,
} from "@/lib/services/profile-service";
import { getReconciledOnboardingState } from "@/lib/services/onboarding-analysis-status-service";
import {
  OnboardingStepUpdateSchema,
  OnboardingSubmissionSchema,
} from "@/lib/validators/profile";
import type { SourceDocumentRecord } from "@/lib/db/types";

class OnboardingSubmissionError extends Error {
  constructor(
    readonly code:
      | "RESUME_NOT_READY"
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

    const resumeVersion = (await listResumeVersions(userId)).find(
      (version) => version.active && version.extractedTextStatus === "EXTRACTED",
    );

    if (!resumeVersion) {
      throw new OnboardingSubmissionError(
        "RESUME_NOT_READY",
        "Resume text is not ready for analysis. Upload your resume again or wait for extraction to finish.",
      );
    }

    const sourceDocument = (await listSourceDocuments(userId)).find(
      (document) => document.id === resumeVersion.sourceDocumentId,
    );

    if (!sourceDocument) {
      throw new OnboardingSubmissionError(
        "RESUME_NOT_READY",
        "Resume text is not ready for analysis. Upload your resume again or wait for extraction to finish.",
      );
    }

    const input = OnboardingSubmissionSchema.parse(
      hydrateOnboardingResumeMetadata(await request.json(), sourceDocument),
    );
    const profile = await markOnboardingCompleted(userId, input);

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

function hydrateOnboardingResumeMetadata(
  value: unknown,
  sourceDocument: SourceDocumentRecord,
): OnboardingSubmission {
  const input =
    value && typeof value === "object" && !Array.isArray(value) ? value : {};

  return {
    ...input,
    resumeName: sourceDocument.originalFilename,
    resumeContentType: sourceDocument.mimeType,
    resumeSize: sourceDocument.fileSize,
    resumeUploadedAt: sourceDocument.createdAt,
  } as OnboardingSubmission;
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
