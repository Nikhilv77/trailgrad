import { auth } from "@clerk/nextjs/server";
import { ZodError } from "zod";

import {
  createProfileAnalysisRequestedEvent,
  inngest,
} from "@/lib/inngest/client";
import { buildAnalysisInputFingerprint } from "@/lib/onboarding/analysis-input-fingerprint";
import {
  attachAnalysisJobToApplicationRecord,
  createJobApplicationRecord,
  listJobApplicationRecords,
} from "@/lib/db/application-repository";
import {
  buildAnalysisJobIdempotencyKey,
  requestAnalysisJob,
} from "@/lib/services/analysis-job-service";
import {
  getOnboardingState,
  listResumeVersions,
} from "@/lib/services/profile-service";
import {
  ApplicationRequestSchema,
  ApplicationSubmissionSchema,
  OnboardingSubmissionSchema,
} from "@/lib/validators/profile";

class ApplicationRouteError extends Error {
  constructor(
    readonly code:
      | "AUTHENTICATION_REQUIRED"
      | "ONBOARDING_NOT_COMPLETE"
      | "APPLICATION_INVALID_INPUT"
      | "RESUME_NOT_READY"
      | "ANALYSIS_QUEUE_UNAVAILABLE",
    message: string,
  ) {
    super(message);
    this.name = "ApplicationRouteError";
  }
}

export async function GET() {
  try {
    const userId = await requireUserId();
    const applications = await listJobApplicationRecords(userId);

    return Response.json({ applications });
  } catch (error) {
    const safeError = getSafeApplicationError(error);

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
    const userId = await requireUserId();
    const state = await getOnboardingState(userId);

    if (state.status !== "completed") {
      throw new ApplicationRouteError(
        "ONBOARDING_NOT_COMPLETE",
        "Complete onboarding before creating a trail.",
      );
    }

    const onboarding = OnboardingSubmissionSchema.safeParse(state.onboarding);

    if (!onboarding.success) {
      throw new ApplicationRouteError(
        "ONBOARDING_NOT_COMPLETE",
        "Complete onboarding before creating a trail.",
      );
    }

    const requestInput = ApplicationRequestSchema.parse(await request.json());
    const input = ApplicationSubmissionSchema.parse({
      ...requestInput,
      targetRole: onboarding.data.targetRole,
      experienceLevel: onboarding.data.experienceLevel,
    });
    const resumeVersion = (await listResumeVersions(userId)).find(
      (version) => version.active && version.extractedTextStatus === "EXTRACTED",
    );

    if (!resumeVersion) {
      throw new ApplicationRouteError(
        "RESUME_NOT_READY",
        "Upload a resume before creating a trail.",
      );
    }

    const application = await createJobApplicationRecord({
      profileId: userId,
      application: input,
    });
    const targetContextId = application.targetContextId;

    if (!targetContextId) {
      throw new ApplicationRouteError(
        "APPLICATION_INVALID_INPUT",
        "Unable to prepare the trail target context.",
      );
    }

    const inputFingerprint = `${application.id}:${buildAnalysisInputFingerprint(input)}`;
    const idempotencyKey = buildAnalysisJobIdempotencyKey({
      inputFingerprint,
      profileId: userId,
      sourceDocumentId: resumeVersion.sourceDocumentId,
      type: "JOB_ANALYSIS",
    });
    const reservation = await requestAnalysisJob({
      profileId: userId,
      sourceDocumentId: resumeVersion.sourceDocumentId,
      targetContextId,
      type: "JOB_ANALYSIS",
      idempotencyKey,
    });
    const savedApplication = await attachAnalysisJobToApplicationRecord({
      applicationId: application.id,
      profileId: userId,
      analysisJobId: reservation.job.id,
    });

    try {
      await inngest.send(
        createProfileAnalysisRequestedEvent({
          profileId: userId,
          sourceDocumentId: resumeVersion.sourceDocumentId,
          targetContextId,
          type: "JOB_ANALYSIS",
          idempotencyKey,
          eventId: reservation.duplicate
            ? `${idempotencyKey}:retry:${reservation.job.attemptCount + 1}:${Date.now()}`
            : idempotencyKey,
        }),
      );
    } catch (error) {
      console.error("[applications] Failed to queue trail analysis.", error);

      throw new ApplicationRouteError(
        "ANALYSIS_QUEUE_UNAVAILABLE",
        "Trailgrad saved your trail, but could not queue the analysis. For local development, run the Inngest dev server and set INNGEST_DEV=1.",
      );
    }

    return Response.json({
      application: savedApplication ?? application,
      analysisJobId: reservation.job.id,
      duplicate: reservation.duplicate,
      status: "queued",
    });
  } catch (error) {
    const safeError = getSafeApplicationError(error);

    return Response.json(
      {
        code: safeError.code,
        error: safeError.message,
      },
      { status: getStatusCode(safeError.code) },
    );
  }
}

async function requireUserId() {
  const { userId } = await auth();

  if (!userId) {
    throw new ApplicationRouteError(
      "AUTHENTICATION_REQUIRED",
      "Authentication required.",
    );
  }

  return userId;
}

function getSafeApplicationError(error: unknown) {
  if (error instanceof ZodError) {
    return {
      code: "APPLICATION_INVALID_INPUT" as const,
      message: error.issues[0]?.message ?? "Invalid trail payload.",
    };
  }

  if (error instanceof ApplicationRouteError) {
    return {
      code: error.code,
      message: error.message,
    };
  }

  console.error("[applications] Failed to create trail.", error);

  return {
    code: "ANALYSIS_QUEUE_UNAVAILABLE" as const,
    message: "Trailgrad could not create this trail.",
  };
}

function getStatusCode(
  code: ReturnType<typeof getSafeApplicationError>["code"],
) {
  if (code === "AUTHENTICATION_REQUIRED") return 401;
  if (code === "ONBOARDING_NOT_COMPLETE") return 409;
  if (code === "RESUME_NOT_READY") return 409;
  if (code === "APPLICATION_INVALID_INPUT") return 400;
  return 500;
}
