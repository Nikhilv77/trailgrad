import { auth } from "@clerk/nextjs/server";

export { POST } from "@/app/api/applications/route";

import { findAnalysisJobByIdRecord } from "@/lib/db/analysis-job-repository";
import { findLatestCompletedProfileAnalysisRecord } from "@/lib/db/profile-analysis-repository";

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

function getSafeReanalysisError(error: unknown) {
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
