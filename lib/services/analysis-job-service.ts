import {
  claimAnalysisJobRecord,
  completeAnalysisJobRecord,
  createAnalysisJobRecord,
  failAnalysisJobRecord,
  findAnalysisJobByIdRecord,
  updateAnalysisJobProgressRecord,
} from "@/lib/db/analysis-job-repository";
import type {
  AnalysisJobRecord,
  AnalysisJobReservation,
  AnalysisJobStage,
  AnalysisJobType,
} from "@/lib/analysis/types";
import { AnalysisJobError, analysisJobStages } from "@/lib/analysis/types";

export interface RequestAnalysisJobInput {
  profileId: string;
  sourceDocumentId?: string | null;
  type: AnalysisJobType;
  idempotencyKey?: string;
}

export interface AnalysisRunResult {
  job: AnalysisJobRecord;
  executed: boolean;
  reason: "completed" | "already_active_or_terminal";
}

const stageProgress: Record<AnalysisJobStage, number> = {
  resume_analysis: 14,
  target_analysis: 28,
  profile_reconciliation: 42,
  risk_generation: 56,
  sprint_generation: 70,
  question_generation: 84,
  finalization: 98,
};

export async function requestAnalysisJob(
  input: RequestAnalysisJobInput,
): Promise<AnalysisJobReservation> {
  const idempotencyKey =
    input.idempotencyKey ??
    buildAnalysisJobIdempotencyKey({
      profileId: input.profileId,
      sourceDocumentId: input.sourceDocumentId ?? null,
      type: input.type,
    });

  return createAnalysisJobRecord({
    profileId: input.profileId,
    sourceDocumentId: input.sourceDocumentId ?? null,
    type: input.type,
    idempotencyKey,
  });
}

export async function claimAnalysisJobForRun(jobId: string) {
  return claimAnalysisJobRecord(jobId);
}

export async function persistAnalysisJobProgress(
  jobId: string,
  stage: AnalysisJobStage,
) {
  return updateAnalysisJobProgressRecord(jobId, stage, stageProgress[stage]);
}

export async function completeAnalysisJob(jobId: string) {
  const completed = await completeAnalysisJobRecord(jobId);

  if (!completed) {
    throw new AnalysisJobError(
      "ANALYSIS_JOB_NOT_FOUND",
      "Analysis job could not be completed from its current state.",
    );
  }

  return completed;
}

export async function failAnalysisJob(jobId: string, error: unknown) {
  const safeError = toSafeAnalysisJobError(error);

  return failAnalysisJobRecord({
    jobId,
    safeErrorCode: safeError.code,
    safeErrorMessage: safeError.message,
  });
}

export async function runPersistedAnalysisJob(jobId: string): Promise<AnalysisRunResult> {
  const claimed = await claimAnalysisJobForRun(jobId);

  if (!claimed) {
    const job = await findAnalysisJobByIdRecord(jobId);

    if (!job) {
      throw new AnalysisJobError("ANALYSIS_JOB_NOT_FOUND", "Analysis job not found.");
    }

    return {
      job,
      executed: false,
      reason: "already_active_or_terminal",
    };
  }

  try {
    for (const stage of analysisJobStages) {
      await persistAnalysisJobProgress(claimed.id, stage);
    }

    return {
      job: await completeAnalysisJob(claimed.id),
      executed: true,
      reason: "completed",
    };
  } catch (error) {
    await failAnalysisJob(claimed.id, error);
    throw error;
  }
}

export function buildAnalysisJobIdempotencyKey(input: {
  inputFingerprint?: string | null;
  profileId: string;
  sourceDocumentId: string | null;
  type: AnalysisJobType;
}) {
  const sourceDocumentKey = input.sourceDocumentId ?? "profile";
  const inputFingerprintKey = input.inputFingerprint
    ? `:${input.inputFingerprint}`
    : "";

  return `${input.type}:${input.profileId}:${sourceDocumentKey}${inputFingerprintKey}`;
}

export function toSafeAnalysisJobError(error: unknown) {
  if (error instanceof AnalysisJobError) {
    return {
      code: error.code,
      message: error.message,
    };
  }

  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    "message" in error &&
    typeof error.code === "string" &&
    typeof error.message === "string"
  ) {
    return {
      code: error.code,
      message: error.message,
    };
  }

  return {
    code: "ANALYSIS_JOB_FAILED",
    message: "Trailgrad could not complete this analysis job. Please try again.",
  };
}
