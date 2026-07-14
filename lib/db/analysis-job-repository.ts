import { randomUUID } from "node:crypto";

import type { AnalysisJob } from "@/lib/generated/prisma/client";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { ensureProfilesTable, getOrCreateProfileRecord } from "@/lib/db/profile-repository";
import type {
  AnalysisJobRecord,
  AnalysisJobReservation,
  AnalysisJobStage,
  AnalysisJobType,
} from "@/lib/analysis/types";
import { AnalysisJobError, isAnalysisJobStage } from "@/lib/analysis/types";

function toIsoString(value: Date | null) {
  return value ? value.toISOString() : null;
}

function toAnalysisJobRecord(row: AnalysisJob): AnalysisJobRecord {
  if (!isAnalysisJobStage(row.currentStage)) {
    throw new AnalysisJobError(
      "ANALYSIS_JOB_INVALID_STAGE",
      "Analysis job has an unknown persisted stage.",
    );
  }

  return {
    id: row.id,
    profileId: row.profileId,
    sourceDocumentId: row.sourceDocumentId,
    targetContextId: row.targetContextId,
    type: row.type,
    status: row.status,
    currentStage: row.currentStage,
    progressPercent: row.progressPercent,
    idempotencyKey: row.idempotencyKey,
    attemptCount: row.attemptCount,
    safeErrorCode: row.safeErrorCode,
    safeErrorMessage: row.safeErrorMessage,
    startedAt: toIsoString(row.startedAt),
    completedAt: toIsoString(row.completedAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function findAnalysisJobByIdRecord(jobId: string) {
  await ensureProfilesTable();

  const job = await prisma.analysisJob.findUnique({
    where: {
      id: jobId,
    },
  });

  return job ? toAnalysisJobRecord(job) : null;
}

export async function findAnalysisJobByIdempotencyKeyRecord(idempotencyKey: string) {
  await ensureProfilesTable();

  const job = await prisma.analysisJob.findUnique({
    where: {
      idempotencyKey,
    },
  });

  return job ? toAnalysisJobRecord(job) : null;
}

export async function findSourceDocumentOwnerRecord(
  profileId: string,
  sourceDocumentId: string,
) {
  await ensureProfilesTable();

  return prisma.sourceDocument.findFirst({
    where: {
      id: sourceDocumentId,
      profileId,
    },
    select: {
      id: true,
      profileId: true,
    },
  });
}

export async function findTargetContextOwnerRecord(
  profileId: string,
  targetContextId: string,
) {
  await ensureProfilesTable();

  return prisma.targetContext.findFirst({
    where: {
      id: targetContextId,
      profileId,
    },
    select: {
      id: true,
      profileId: true,
    },
  });
}

export async function createAnalysisJobRecord(input: {
  profileId: string;
  sourceDocumentId?: string | null;
  targetContextId?: string | null;
  type: AnalysisJobType;
  idempotencyKey: string;
}): Promise<AnalysisJobReservation> {
  await ensureProfilesTable();
  await getOrCreateProfileRecord(input.profileId);

  if (input.sourceDocumentId) {
    const sourceDocument = await findSourceDocumentOwnerRecord(
      input.profileId,
      input.sourceDocumentId,
    );

    if (!sourceDocument) {
      throw new AnalysisJobError(
        "ANALYSIS_JOB_SOURCE_NOT_OWNED",
        "The source document does not belong to this Trailgrad profile.",
      );
    }
  }

  if (input.targetContextId) {
    const targetContext = await findTargetContextOwnerRecord(
      input.profileId,
      input.targetContextId,
    );

    if (!targetContext) {
      throw new AnalysisJobError(
        "ANALYSIS_JOB_TARGET_NOT_OWNED",
        "The target context does not belong to this Trailgrad profile.",
      );
    }
  }

  const existing = await findAnalysisJobByIdempotencyKeyRecord(input.idempotencyKey);

  if (existing) {
    return {
      job: existing,
      duplicate: true,
    };
  }

  try {
    const job = await prisma.analysisJob.create({
      data: {
        id: randomUUID(),
        profileId: input.profileId,
        sourceDocumentId: input.sourceDocumentId ?? null,
        targetContextId: input.targetContextId ?? null,
        type: input.type,
        status: "QUEUED",
        currentStage: "resume_analysis",
        progressPercent: 0,
        idempotencyKey: input.idempotencyKey,
      },
    });

    return {
      job: toAnalysisJobRecord(job),
      duplicate: false,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const existingAfterRace = await findAnalysisJobByIdempotencyKeyRecord(
        input.idempotencyKey,
      );

      if (existingAfterRace) {
        return {
          job: existingAfterRace,
          duplicate: true,
        };
      }
    }

    throw error;
  }
}

export async function claimAnalysisJobRecord(jobId: string) {
  await ensureProfilesTable();

  const now = new Date();
  const result = await prisma.analysisJob.updateMany({
    where: {
      id: jobId,
      status: {
        in: ["QUEUED", "FAILED"],
      },
    },
    data: {
      status: "RUNNING",
      currentStage: "resume_analysis",
      progressPercent: 0,
      safeErrorCode: null,
      safeErrorMessage: null,
      startedAt: now,
      completedAt: null,
      attemptCount: {
        increment: 1,
      },
      updatedAt: now,
    },
  });

  if (result.count === 0) {
    return null;
  }

  return findAnalysisJobByIdRecord(jobId);
}

export async function updateAnalysisJobProgressRecord(
  jobId: string,
  stage: AnalysisJobStage,
  progressPercent: number,
) {
  await ensureProfilesTable();

  const job = await prisma.analysisJob.update({
    where: {
      id: jobId,
    },
    data: {
      currentStage: stage,
      progressPercent,
      updatedAt: new Date(),
    },
  });

  return toAnalysisJobRecord(job);
}

export async function completeAnalysisJobRecord(jobId: string) {
  await ensureProfilesTable();

  const now = new Date();
  const result = await prisma.analysisJob.updateMany({
    where: {
      id: jobId,
      status: "RUNNING",
    },
    data: {
      status: "COMPLETED",
      currentStage: "finalization",
      progressPercent: 100,
      completedAt: now,
      safeErrorCode: null,
      safeErrorMessage: null,
      updatedAt: now,
    },
  });

  if (result.count === 0) {
    return null;
  }

  return findAnalysisJobByIdRecord(jobId);
}

export async function failAnalysisJobRecord(input: {
  jobId: string;
  safeErrorCode: string;
  safeErrorMessage: string;
}) {
  await ensureProfilesTable();

  const now = new Date();
  const result = await prisma.analysisJob.updateMany({
    where: {
      id: input.jobId,
      status: "RUNNING",
    },
    data: {
      status: "FAILED",
      safeErrorCode: input.safeErrorCode,
      safeErrorMessage: input.safeErrorMessage,
      completedAt: now,
      updatedAt: now,
    },
  });

  if (result.count === 0) {
    return null;
  }

  return findAnalysisJobByIdRecord(input.jobId);
}

export async function cancelAnalysisJobRecord(jobId: string) {
  await ensureProfilesTable();

  const now = new Date();
  const job = await prisma.analysisJob.update({
    where: {
      id: jobId,
    },
    data: {
      status: "CANCELLED",
      completedAt: now,
      updatedAt: now,
    },
  });

  return toAnalysisJobRecord(job);
}
