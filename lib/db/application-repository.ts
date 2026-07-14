import { randomUUID } from "node:crypto";

import type { JobApplication } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  ensureProfilesTable,
  getOrCreateProfileRecord,
} from "@/lib/db/profile-repository";
import type { JobApplicationRecord } from "@/lib/db/types";
import type { ApplicationSubmission } from "@/lib/applications/types";

function toDateString(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : null;
}

function toJobApplicationRecord(row: JobApplication): JobApplicationRecord {
  return {
    id: row.id,
    profileId: row.profileId,
    targetContextId: row.targetContextId,
    trailFocus: row.trailFocus as JobApplicationRecord["trailFocus"],
    targetRole: row.targetRole,
    experienceLevel: row.experienceLevel,
    targetCompany: row.targetCompany,
    targetJobTitle: row.targetJobTitle,
    applicationDate: toDateString(row.applicationDate),
    noDateYet: row.noDateYet,
    preparationTimePerDay:
      row.preparationTimePerDay as JobApplicationRecord["preparationTimePerDay"],
    preparationIntensity:
      row.preparationIntensity as JobApplicationRecord["preparationIntensity"],
    targetJobMode: row.targetJobMode as JobApplicationRecord["targetJobMode"],
    jobDescription: row.jobDescription,
    analysisJobId: row.analysisJobId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listJobApplicationRecords(profileId: string) {
  await ensureProfilesTable();

  const applications = await prisma.jobApplication.findMany({
    where: {
      profileId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return applications.map(toJobApplicationRecord);
}

export async function createJobApplicationRecord(input: {
  profileId: string;
  application: ApplicationSubmission;
}) {
  await ensureProfilesTable();
  await getOrCreateProfileRecord(input.profileId);

  const applicationId = randomUUID();
  const targetContextId = `target:${applicationId}`;
  const trailFocus = input.application.trailFocus;
  const applicationDate = getApplicationDate(input.application);
  const targetCompany = emptyToNull(input.application.targetCompany);
  const targetJobTitle = emptyToNull(input.application.targetJobTitle);
  const jobDescription =
    input.application.targetJobMode === "paste"
      ? emptyToNull(input.application.jobDescription)
      : null;

  const application = await prisma.$transaction(async (tx) => {
    await tx.careerContext.upsert({
      where: {
        profileId: input.profileId,
      },
      create: {
        profileId: input.profileId,
        primaryTargetRole: input.application.targetRole,
        experienceLevel: input.application.experienceLevel,
        targetCompany,
        targetJobTitle,
        interviewOrApplicationDate: applicationDate,
        noDateYet: Boolean(input.application.noDateYet),
        dailyPreparationMinutes: getPreparationMinutes(
          input.application.preparationTimePerDay,
        ),
        flexiblePreparationTime:
          input.application.preparationTimePerDay === "flexible",
        preparationIntensity: input.application.preparationIntensity,
        timezone: null,
      },
      update: {
        primaryTargetRole: input.application.targetRole,
        experienceLevel: input.application.experienceLevel,
        targetCompany,
        targetJobTitle,
        interviewOrApplicationDate: applicationDate,
        noDateYet: Boolean(input.application.noDateYet),
        dailyPreparationMinutes: getPreparationMinutes(
          input.application.preparationTimePerDay,
        ),
        flexiblePreparationTime:
          input.application.preparationTimePerDay === "flexible",
        preparationIntensity: input.application.preparationIntensity,
        timezone: null,
        updatedAt: new Date(),
      },
    });

    await tx.targetContext.updateMany({
      where: {
        profileId: input.profileId,
        isActive: true,
      },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    await tx.targetContext.create({
      data: {
        id: targetContextId,
        profileId: input.profileId,
        trailFocus,
        role: input.application.targetRole,
        company: targetCompany,
        jobTitle: targetJobTitle,
        jobDescription,
        isActive: true,
      },
    });

    return tx.jobApplication.create({
      data: {
        id: applicationId,
        profileId: input.profileId,
        targetContextId,
        trailFocus,
        targetRole: input.application.targetRole,
        experienceLevel: input.application.experienceLevel,
        targetCompany,
        targetJobTitle,
        applicationDate,
        noDateYet: Boolean(input.application.noDateYet),
        preparationTimePerDay: input.application.preparationTimePerDay,
        preparationIntensity: input.application.preparationIntensity,
        targetJobMode: input.application.targetJobMode,
        jobDescription,
      },
    });
  });

  return toJobApplicationRecord(application);
}

export async function attachAnalysisJobToApplicationRecord(input: {
  applicationId: string;
  profileId: string;
  analysisJobId: string;
}) {
  await ensureProfilesTable();

  const existing = await prisma.jobApplication.findFirst({
    where: {
      id: input.applicationId,
      profileId: input.profileId,
    },
    select: {
      id: true,
    },
  });

  if (!existing) {
    return null;
  }

  const application = await prisma.jobApplication.update({
    where: {
      id: input.applicationId,
    },
    data: {
      analysisJobId: input.analysisJobId,
      updatedAt: new Date(),
    },
  });

  return toJobApplicationRecord(application);
}

function emptyToNull(value: string | undefined) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function getApplicationDate(application: ApplicationSubmission) {
  if (application.noDateYet || !application.applicationDate) {
    return null;
  }

  return new Date(`${application.applicationDate}T00:00:00.000Z`);
}

function getPreparationMinutes(
  value: ApplicationSubmission["preparationTimePerDay"],
) {
  return value === "flexible" ? null : Number(value);
}

export const applicationRepositoryTestInternals = {
  toDateString,
};
