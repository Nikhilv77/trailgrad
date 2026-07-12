import { randomUUID } from "node:crypto";

import type { Prisma, ProfileAnalysis } from "@/lib/generated/prisma/client";
import { Prisma as PrismaNamespace } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { ensureProfilesTable } from "@/lib/db/profile-repository";
import type { MVPAnalysis } from "@/lib/ai/schemas/mvp-analysis";

export interface ProfileAnalysisRecord {
  id: string;
  profileId: string;
  resumeVersionId: string;
  targetContextId: string | null;
  status: "PENDING" | "COMPLETED" | "FAILED";
  result: MVPAnalysis | null;
  promptVersion: string;
  provider: string;
  model: string;
  safeErrorCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MVPAnalysisInputContext {
  profileId: string;
  onboarding: unknown;
  resumeVersion: {
    id: string;
    sourceDocumentId: string;
    extractedText: string;
  };
  careerContext: {
    primaryTargetRole: string;
    experienceLevel: string;
    interviewOrApplicationDate: string | null;
    noDateYet: boolean;
    dailyPreparationMinutes: number | null;
    flexiblePreparationTime: boolean;
    preparationIntensity: string;
  } | null;
  targetContext: {
    id: string;
    role: string;
    company: string | null;
    jobTitle: string | null;
    jobDescription: string | null;
  } | null;
}

function toProfileAnalysisRecord(row: ProfileAnalysis): ProfileAnalysisRecord {
  return {
    id: row.id,
    profileId: row.profileId,
    resumeVersionId: row.resumeVersionId,
    targetContextId: row.targetContextId,
    status: row.status,
    result: row.result ? (row.result as MVPAnalysis) : null,
    promptVersion: row.promptVersion,
    provider: row.provider,
    model: row.model,
    safeErrorCode: row.safeErrorCode,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function loadMVPAnalysisInputContextRecord(input: {
  profileId: string;
  sourceDocumentId?: string | null;
}): Promise<MVPAnalysisInputContext | null> {
  await ensureProfilesTable();

  const profile = await prisma.userProfile.findUnique({
    where: {
      clerkUserId: input.profileId,
    },
    include: {
      careerContext: true,
      targetContexts: {
        where: {
          isActive: true,
        },
        take: 1,
      },
      resumeVersions: {
        where: {
          active: true,
          extractedTextStatus: "EXTRACTED",
          extractedText: {
            not: null,
          },
          ...(input.sourceDocumentId
            ? { sourceDocumentId: input.sourceDocumentId }
            : {}),
        },
        orderBy: {
          version: "desc",
        },
        take: 1,
      },
    },
  });
  const resumeVersion = profile?.resumeVersions[0];

  if (!profile || !resumeVersion?.extractedText) {
    return null;
  }

  const careerContext = profile.careerContext;
  const targetContext = profile.targetContexts[0] ?? null;

  return {
    profileId: profile.clerkUserId,
    onboarding: profile.onboarding,
    resumeVersion: {
      id: resumeVersion.id,
      sourceDocumentId: resumeVersion.sourceDocumentId,
      extractedText: resumeVersion.extractedText,
    },
    careerContext: careerContext
      ? {
          primaryTargetRole: careerContext.primaryTargetRole,
          experienceLevel: careerContext.experienceLevel,
          interviewOrApplicationDate:
            careerContext.interviewOrApplicationDate?.toISOString().slice(0, 10) ??
            null,
          noDateYet: careerContext.noDateYet,
          dailyPreparationMinutes: careerContext.dailyPreparationMinutes,
          flexiblePreparationTime: careerContext.flexiblePreparationTime,
          preparationIntensity: careerContext.preparationIntensity,
        }
      : null,
    targetContext: targetContext
      ? {
          id: targetContext.id,
          role: targetContext.role,
          company: targetContext.company,
          jobTitle: targetContext.jobTitle,
          jobDescription: targetContext.jobDescription,
        }
      : null,
  };
}

export async function findProfileAnalysisRecord(input: {
  profileId: string;
  resumeVersionId: string;
  targetContextId: string | null;
}) {
  await ensureProfilesTable();

  const row = await prisma.profileAnalysis.findFirst({
    where: {
      profileId: input.profileId,
      resumeVersionId: input.resumeVersionId,
      targetContextId: input.targetContextId,
    },
  });

  return row ? toProfileAnalysisRecord(row) : null;
}

export async function findLatestCompletedProfileAnalysisRecord(profileId: string) {
  await ensureProfilesTable();

  const row = await prisma.profileAnalysis.findFirst({
    where: {
      profileId,
      status: "COMPLETED",
      result: {
        not: PrismaNamespace.JsonNull,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return row ? toProfileAnalysisRecord(row) : null;
}

export async function reserveProfileAnalysisRecord(input: {
  profileId: string;
  resumeVersionId: string;
  targetContextId: string | null;
  promptVersion: string;
}) {
  const existing = await findProfileAnalysisRecord(input);

  if (existing) {
    return existing;
  }

  try {
    const row = await prisma.profileAnalysis.create({
      data: {
        id: randomUUID(),
        profileId: input.profileId,
        resumeVersionId: input.resumeVersionId,
        targetContextId: input.targetContextId,
        status: "PENDING",
        result: PrismaNamespace.JsonNull,
        promptVersion: input.promptVersion,
        provider: "pending",
        model: "pending",
        safeErrorCode: null,
      },
    });

    return toProfileAnalysisRecord(row);
  } catch (error) {
    if (
      error instanceof PrismaNamespace.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const existingAfterRace = await findProfileAnalysisRecord(input);

      if (existingAfterRace) {
        return existingAfterRace;
      }
    }

    throw error;
  }
}

export async function completeProfileAnalysisRecord(input: {
  id: string;
  result: MVPAnalysis;
  provider: string;
  model: string;
  promptVersion: string;
}) {
  const row = await prisma.profileAnalysis.update({
    where: {
      id: input.id,
    },
    data: {
      status: "COMPLETED",
      result: input.result as Prisma.InputJsonObject,
      provider: input.provider,
      model: input.model,
      promptVersion: input.promptVersion,
      safeErrorCode: null,
      updatedAt: new Date(),
    },
  });

  return toProfileAnalysisRecord(row);
}

export async function failProfileAnalysisRecord(input: {
  id: string;
  provider?: string;
  model?: string;
  safeErrorCode: string;
}) {
  const row = await prisma.profileAnalysis.update({
    where: {
      id: input.id,
    },
    data: {
      status: "FAILED",
      provider: input.provider ?? "unknown",
      model: input.model ?? "unknown",
      safeErrorCode: input.safeErrorCode,
      updatedAt: new Date(),
    },
  });

  return toProfileAnalysisRecord(row);
}
