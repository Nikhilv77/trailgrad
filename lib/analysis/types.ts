import type {
  AnalysisJobStatus,
  AnalysisJobType,
} from "@/lib/generated/prisma/enums";

export type { AnalysisJobStatus, AnalysisJobType };

export const analysisJobStages = [
  "resume_analysis",
  "target_analysis",
  "profile_reconciliation",
  "risk_generation",
  "sprint_generation",
  "question_generation",
  "finalization",
] as const;

export type AnalysisJobStage = (typeof analysisJobStages)[number];

export interface AnalysisJobRecord {
  id: string;
  profileId: string;
  sourceDocumentId: string | null;
  targetContextId: string | null;
  type: AnalysisJobType;
  status: AnalysisJobStatus;
  currentStage: AnalysisJobStage;
  progressPercent: number;
  idempotencyKey: string;
  attemptCount: number;
  safeErrorCode: string | null;
  safeErrorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisJobReservation {
  job: AnalysisJobRecord;
  duplicate: boolean;
}

export class AnalysisJobError extends Error {
  constructor(
    readonly code:
      | "ANALYSIS_JOB_NOT_FOUND"
      | "ANALYSIS_JOB_SOURCE_NOT_FOUND"
      | "ANALYSIS_JOB_SOURCE_NOT_OWNED"
      | "ANALYSIS_JOB_TARGET_NOT_OWNED"
      | "ANALYSIS_JOB_INVALID_STAGE"
      | "ANALYSIS_JOB_FAILED",
    message: string,
  ) {
    super(message);
    this.name = "AnalysisJobError";
  }
}

export function isAnalysisJobStage(value: string): value is AnalysisJobStage {
  return (analysisJobStages as readonly string[]).includes(value);
}
