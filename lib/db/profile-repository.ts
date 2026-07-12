import { randomUUID } from "node:crypto";

import type {
  CareerContext,
  ManualProject,
  ResumeVersion,
  SourceDocument,
  TargetContext,
  UserProfile,
} from "@/lib/generated/prisma/client";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import type {
  CareerContextRecord,
  ManualProjectRecord,
  ResumeVersionRecord,
  SourceDocumentRecord,
  TargetContextRecord,
} from "@/lib/db/types";
import type {
  OnboardingState,
  OnboardingStatus,
  OnboardingStepId,
  OnboardingSubmission,
} from "@/lib/onboarding/types";
import type { TrailgradProfileRecord } from "@/lib/services/profile-service";

export interface ResumeSourceReservation {
  sourceDocument: SourceDocumentRecord;
  isNew: boolean;
}

let ensureProfilesTablePromise: Promise<void> | null = null;

function toIsoString(value: Date | null) {
  return value ? value.toISOString() : null;
}

function toDateString(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : null;
}

function parseOnboarding(value: Prisma.JsonValue | null) {
  return value ? (value as unknown as OnboardingSubmission) : null;
}

function onboardingToJson(onboarding: Partial<OnboardingSubmission>) {
  return onboarding as Prisma.InputJsonObject;
}

function toProfileRecord(row: UserProfile): TrailgradProfileRecord {
  return {
    clerkUserId: row.clerkUserId,
    onboardingStatus: row.onboardingStatus as OnboardingStatus,
    currentOnboardingStep: row.currentOnboardingStep as OnboardingStepId,
    onboardingStartedAt: toIsoString(row.onboardingStartedAt),
    onboardingCompletedAt: toIsoString(row.onboardingCompletedAt),
    analysisError: row.analysisError,
    onboarding: parseOnboarding(row.onboarding),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toOnboardingState(profile: TrailgradProfileRecord): OnboardingState {
  return {
    status: profile.onboardingStatus,
    currentStep: profile.currentOnboardingStep,
    startedAt: profile.onboardingStartedAt,
    completedAt: profile.onboardingCompletedAt,
    analysisError: profile.analysisError,
    onboarding: profile.onboarding,
  };
}

function toCareerContextRecord(row: CareerContext): CareerContextRecord {
  return {
    profileId: row.profileId,
    primaryTargetRole: row.primaryTargetRole,
    experienceLevel: row.experienceLevel,
    targetCompany: row.targetCompany,
    targetJobTitle: row.targetJobTitle,
    interviewOrApplicationDate: toDateString(row.interviewOrApplicationDate),
    noDateYet: row.noDateYet,
    dailyPreparationMinutes: row.dailyPreparationMinutes,
    flexiblePreparationTime: row.flexiblePreparationTime,
    preparationIntensity: row.preparationIntensity as CareerContextRecord["preparationIntensity"],
    timezone: row.timezone,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toTargetContextRecord(row: TargetContext): TargetContextRecord {
  return {
    id: row.id,
    profileId: row.profileId,
    role: row.role,
    company: row.company,
    jobTitle: row.jobTitle,
    jobDescription: row.jobDescription,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toManualProjectRecord(row: ManualProject): ManualProjectRecord {
  return {
    id: row.id,
    profileId: row.profileId,
    name: row.name,
    description: row.description,
    projectUrl: row.projectUrl,
    repositoryUrl: row.repositoryUrl,
    technologies: row.technologies.length ? row.technologies : null,
    currentStatus: row.currentStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toSourceDocumentRecord(row: SourceDocument): SourceDocumentRecord {
  return {
    id: row.id,
    profileId: row.profileId,
    sourceType: row.sourceType as SourceDocumentRecord["sourceType"],
    originalFilename: row.originalFilename,
    mimeType: row.mimeType,
    storagePath: row.storagePath,
    fileSize: row.fileSize,
    sha256ContentHash: row.sha256ContentHash,
    processingStatus: row.processingStatus as SourceDocumentRecord["processingStatus"],
    errorCode: row.errorCode,
    version: row.version,
    createdAt: row.createdAt.toISOString(),
  };
}

function toResumeVersionRecord(row: ResumeVersion): ResumeVersionRecord {
  return {
    id: row.id,
    profileId: row.profileId,
    sourceDocumentId: row.sourceDocumentId,
    version: row.version,
    extractedTextStatus: row.extractedTextStatus as ResumeVersionRecord["extractedTextStatus"],
    extractedText: row.extractedText,
    errorCode: row.errorCode,
    active: row.active,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function ensureProfilesTable() {
  if (!ensureProfilesTablePromise) {
    ensureProfilesTablePromise = Promise.resolve();
  }

  return ensureProfilesTablePromise;
}

export async function getOrCreateProfileRecord(clerkUserId: string) {
  await ensureProfilesTable();

  const profile = await prisma.userProfile.upsert({
    where: {
      clerkUserId,
    },
    create: {
      clerkUserId,
    },
    update: {},
  });

  return toProfileRecord(profile);
}

export async function getOnboardingStateRecord(clerkUserId: string) {
  return toOnboardingState(await getOrCreateProfileRecord(clerkUserId));
}

export async function updateOnboardingStepRecord(
  clerkUserId: string,
  currentStep: OnboardingStepId,
  onboarding: Partial<OnboardingSubmission>,
) {
  await ensureProfilesTable();

  const existing = await prisma.userProfile.findUnique({
    where: {
      clerkUserId,
    },
  });
  const existingOnboarding = parseOnboarding(existing?.onboarding ?? null);
  const mergedOnboarding = {
    ...(existingOnboarding ?? {}),
    ...onboarding,
  };

  const profile = existing
    ? await prisma.userProfile.update({
        where: {
          clerkUserId,
        },
        data: {
          onboardingStatus:
            existing.onboardingStatus === "completed"
              ? existing.onboardingStatus
              : "in_progress",
          currentOnboardingStep: currentStep,
          onboardingStartedAt: existing.onboardingStartedAt ?? new Date(),
          onboarding: onboardingToJson(mergedOnboarding),
          analysisError: null,
          updatedAt: new Date(),
        },
      })
    : await prisma.userProfile.create({
        data: {
          clerkUserId,
          onboardingStatus: "in_progress",
          currentOnboardingStep: currentStep,
          onboardingStartedAt: new Date(),
          onboarding: onboardingToJson(mergedOnboarding),
          analysisError: null,
        },
      });

  return toProfileRecord(profile);
}

export async function markOnboardingAnalyzingRecord(
  clerkUserId: string,
  onboarding: OnboardingSubmission,
) {
  await ensureProfilesTable();

  const existing = await prisma.userProfile.findUnique({
    where: {
      clerkUserId,
    },
  });
  const profile = existing
    ? await prisma.userProfile.update({
        where: {
          clerkUserId,
        },
        data: {
          onboardingStatus: "analyzing",
          currentOnboardingStep: "review",
          onboardingStartedAt: existing.onboardingStartedAt ?? new Date(),
          onboarding: onboardingToJson(onboarding),
          analysisError: null,
          updatedAt: new Date(),
        },
      })
    : await prisma.userProfile.create({
        data: {
          clerkUserId,
          onboardingStatus: "analyzing",
          currentOnboardingStep: "review",
          onboardingStartedAt: new Date(),
          onboarding: onboardingToJson(onboarding),
          analysisError: null,
        },
      });

  await saveOnboardingDataModelRecord(clerkUserId, onboarding);

  return toProfileRecord(profile);
}

export async function completeProfileOnboardingRecord(
  clerkUserId: string,
  onboarding: OnboardingSubmission,
) {
  await ensureProfilesTable();

  const existing = await prisma.userProfile.findUnique({
    where: {
      clerkUserId,
    },
  });
  const profile = existing
    ? await prisma.userProfile.update({
        where: {
          clerkUserId,
        },
        data: {
          onboardingStatus: "completed",
          currentOnboardingStep: "review",
          onboardingStartedAt: existing.onboardingStartedAt ?? new Date(),
          onboardingCompletedAt: existing.onboardingCompletedAt ?? new Date(),
          onboarding: onboardingToJson(onboarding),
          analysisError: null,
          updatedAt: new Date(),
        },
      })
    : await prisma.userProfile.create({
        data: {
          clerkUserId,
          onboardingStatus: "completed",
          currentOnboardingStep: "review",
          onboardingStartedAt: new Date(),
          onboardingCompletedAt: new Date(),
          onboarding: onboardingToJson(onboarding),
          analysisError: null,
        },
      });

  await saveOnboardingDataModelRecord(clerkUserId, onboarding);

  return toProfileRecord(profile);
}

export async function markOnboardingFailedRecord(
  clerkUserId: string,
  analysisError: string,
) {
  await ensureProfilesTable();

  const existing = await prisma.userProfile.findUnique({
    where: {
      clerkUserId,
    },
  });
  const profile = existing
    ? await prisma.userProfile.update({
        where: {
          clerkUserId,
        },
        data: {
          onboardingStatus: "failed",
          currentOnboardingStep: "review",
          onboardingStartedAt: existing.onboardingStartedAt ?? new Date(),
          analysisError,
          updatedAt: new Date(),
        },
      })
    : await prisma.userProfile.create({
        data: {
          clerkUserId,
          onboardingStatus: "failed",
          currentOnboardingStep: "review",
          onboardingStartedAt: new Date(),
          analysisError,
        },
      });

  return toProfileRecord(profile);
}

export async function findResumeSourceDocumentByHashRecord(
  clerkUserId: string,
  sha256ContentHash: string,
) {
  await ensureProfilesTable();

  const sourceDocument = await prisma.sourceDocument.findFirst({
    where: {
      profileId: clerkUserId,
      sourceType: "resume",
      sha256ContentHash,
    },
  });

  return sourceDocument ? toSourceDocumentRecord(sourceDocument) : null;
}

export async function reserveResumeSourceDocumentRecord(input: {
  clerkUserId: string;
  sourceDocumentId: string;
  originalFilename: string;
  mimeType: string;
  storagePath: string;
  fileSize: number;
  sha256ContentHash: string;
}): Promise<ResumeSourceReservation> {
  await ensureProfilesTable();
  await getOrCreateProfileRecord(input.clerkUserId);

  const existing = await findResumeSourceDocumentByHashRecord(
    input.clerkUserId,
    input.sha256ContentHash,
  );

  if (existing) {
    return {
      sourceDocument: existing,
      isNew: false,
    };
  }

  try {
    const sourceDocument = await prisma.$transaction(async (tx) => {
      const nextVersion =
        ((await tx.sourceDocument.aggregate({
          where: {
            profileId: input.clerkUserId,
            sourceType: "resume",
          },
          _max: {
            version: true,
          },
        }))._max.version ?? 0) + 1;

      return tx.sourceDocument.create({
        data: {
          id: input.sourceDocumentId,
          profileId: input.clerkUserId,
          sourceType: "resume",
          originalFilename: input.originalFilename,
          mimeType: input.mimeType,
          storagePath: input.storagePath,
          fileSize: input.fileSize,
          sha256ContentHash: input.sha256ContentHash,
          processingStatus: "UPLOADED",
          version: nextVersion,
          errorCode: null,
        },
      });
    });

    return {
      sourceDocument: toSourceDocumentRecord(sourceDocument),
      isNew: true,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const existingAfterRace = await findResumeSourceDocumentByHashRecord(
        input.clerkUserId,
        input.sha256ContentHash,
      );

      if (existingAfterRace) {
        return {
          sourceDocument: existingAfterRace,
          isNew: false,
        };
      }
    }

    throw error;
  }
}

export async function markResumeSourceDocumentStatusRecord(
  clerkUserId: string,
  sourceDocumentId: string,
  status: SourceDocumentRecord["processingStatus"],
  errorCode?: string,
) {
  await ensureProfilesTable();

  const sourceDocument = await prisma.sourceDocument.update({
    where: {
      id: sourceDocumentId,
      profileId: clerkUserId,
    },
    data: {
      processingStatus: status,
      errorCode: errorCode ?? null,
    },
  });

  return toSourceDocumentRecord(sourceDocument);
}

export async function activateResumeVersionRecord(input: {
  clerkUserId: string;
  sourceDocumentId: string;
  extractedText: string | null;
  extractedTextStatus: ResumeVersionRecord["extractedTextStatus"];
  errorCode?: string;
}) {
  await ensureProfilesTable();

  const resumeVersion = await prisma.$transaction(async (tx) => {
    const sourceDocument = await tx.sourceDocument.findFirstOrThrow({
      where: {
        id: input.sourceDocumentId,
        profileId: input.clerkUserId,
        sourceType: "resume",
      },
    });

    await tx.resumeVersion.updateMany({
      where: {
        profileId: input.clerkUserId,
        active: true,
      },
      data: {
        active: false,
      },
    });

    const existing = await tx.resumeVersion.findFirst({
      where: {
        profileId: input.clerkUserId,
        sourceDocumentId: input.sourceDocumentId,
      },
    });

    if (existing) {
      return tx.resumeVersion.update({
        where: {
          id: existing.id,
        },
        data: {
          ...(input.extractedText !== null
            ? { extractedText: input.extractedText }
            : {}),
          extractedTextStatus: input.extractedTextStatus,
          errorCode: input.errorCode ?? null,
          active: true,
        },
      });
    }

    return tx.resumeVersion.create({
      data: {
        id: randomUUID(),
        profileId: input.clerkUserId,
        sourceDocumentId: input.sourceDocumentId,
        version: sourceDocument.version,
        extractedText: input.extractedText,
        extractedTextStatus: input.extractedTextStatus,
        errorCode: input.errorCode ?? null,
        active: true,
      },
    });
  });

  return toResumeVersionRecord(resumeVersion);
}

export async function updateOnboardingResumeMetadataRecord(
  clerkUserId: string,
  resume: {
    fileName: string;
    contentType: string;
    fileSize: number;
    uploadedAt?: string;
  },
) {
  const existing = await prisma.userProfile.findUnique({
    where: {
      clerkUserId,
    },
  });
  const currentOnboarding = parseOnboarding(existing?.onboarding ?? null);
  const profile = await prisma.userProfile.update({
    where: {
      clerkUserId,
    },
    data: {
      onboarding: onboardingToJson({
        ...(currentOnboarding ?? {}),
        resumeName: resume.fileName,
        resumeContentType: resume.contentType,
        resumeSize: resume.fileSize,
        resumeUploadedAt: resume.uploadedAt ?? new Date().toISOString(),
      }),
      updatedAt: new Date(),
    },
  });

  return toProfileRecord(profile);
}

export async function saveOnboardingDataModelRecord(
  clerkUserId: string,
  onboarding: OnboardingSubmission,
) {
  await ensureProfilesTable();
  await getOrCreateProfileRecord(clerkUserId);
  await upsertCareerContextRecord(clerkUserId, onboarding);
  await upsertTargetContextRecord(clerkUserId, onboarding);
  await upsertManualProjectRecord(clerkUserId, onboarding);
}

export async function upsertCareerContextRecord(
  clerkUserId: string,
  onboarding: OnboardingSubmission,
) {
  await ensureProfilesTable();

  const careerContext = await prisma.careerContext.upsert({
    where: {
      profileId: clerkUserId,
    },
    create: {
      profileId: clerkUserId,
      primaryTargetRole: onboarding.targetRole,
      experienceLevel: onboarding.experienceLevel,
      targetCompany: emptyToNull(onboarding.targetCompany),
      targetJobTitle: emptyToNull(onboarding.targetJobTitle),
      interviewOrApplicationDate: getInterviewDate(onboarding),
      noDateYet: Boolean(onboarding.noDateYet),
      dailyPreparationMinutes: getPreparationMinutes(onboarding.preparationTimePerDay),
      flexiblePreparationTime: onboarding.preparationTimePerDay === "flexible",
      preparationIntensity: onboarding.preparationIntensity,
      timezone: null,
    },
    update: {
      primaryTargetRole: onboarding.targetRole,
      experienceLevel: onboarding.experienceLevel,
      targetCompany: emptyToNull(onboarding.targetCompany),
      targetJobTitle: emptyToNull(onboarding.targetJobTitle),
      interviewOrApplicationDate: getInterviewDate(onboarding),
      noDateYet: Boolean(onboarding.noDateYet),
      dailyPreparationMinutes: getPreparationMinutes(onboarding.preparationTimePerDay),
      flexiblePreparationTime: onboarding.preparationTimePerDay === "flexible",
      preparationIntensity: onboarding.preparationIntensity,
      timezone: null,
      updatedAt: new Date(),
    },
  });

  return toCareerContextRecord(careerContext);
}

export async function upsertTargetContextRecord(
  clerkUserId: string,
  onboarding: OnboardingSubmission,
) {
  await ensureProfilesTable();

  const targetContext = await prisma.$transaction(async (tx) => {
    await tx.targetContext.updateMany({
      where: {
        profileId: clerkUserId,
        isActive: true,
      },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return tx.targetContext.upsert({
      where: {
        id: getActiveTargetContextId(clerkUserId),
      },
      create: {
        id: getActiveTargetContextId(clerkUserId),
        profileId: clerkUserId,
        role: onboarding.targetRole,
        company: emptyToNull(onboarding.targetCompany),
        jobTitle: emptyToNull(onboarding.targetJobTitle),
        jobDescription:
          onboarding.targetJobMode === "paste"
            ? emptyToNull(onboarding.jobDescription)
            : null,
        isActive: true,
      },
      update: {
        role: onboarding.targetRole,
        company: emptyToNull(onboarding.targetCompany),
        jobTitle: emptyToNull(onboarding.targetJobTitle),
        jobDescription:
          onboarding.targetJobMode === "paste"
            ? emptyToNull(onboarding.jobDescription)
            : null,
        isActive: true,
        updatedAt: new Date(),
      },
    });
  });

  return toTargetContextRecord(targetContext);
}

export async function upsertManualProjectRecord(
  clerkUserId: string,
  onboarding: OnboardingSubmission,
) {
  await ensureProfilesTable();

  if (onboarding.projectsMode !== "manual" || !onboarding.projectName?.trim()) {
    return null;
  }

  const manualProject = await prisma.manualProject.upsert({
    where: {
      profileId_name: {
        profileId: clerkUserId,
        name: onboarding.projectName.trim(),
      },
    },
    create: {
      id: randomUUID(),
      profileId: clerkUserId,
      name: onboarding.projectName.trim(),
      description: onboarding.projectDescription?.trim() ?? "",
      technologies: getTechnologies(onboarding.projectTechStack),
      currentStatus: "active",
    },
    update: {
      description: onboarding.projectDescription?.trim() ?? "",
      technologies: getTechnologies(onboarding.projectTechStack),
      currentStatus: "active",
      updatedAt: new Date(),
    },
  });

  return toManualProjectRecord(manualProject);
}

export async function getCareerContextRecord(clerkUserId: string) {
  await ensureProfilesTable();

  const careerContext = await prisma.careerContext.findUnique({
    where: {
      profileId: clerkUserId,
    },
  });

  return careerContext ? toCareerContextRecord(careerContext) : null;
}

export async function getActiveTargetContextRecord(clerkUserId: string) {
  await ensureProfilesTable();

  const targetContext = await prisma.targetContext.findFirst({
    where: {
      profileId: clerkUserId,
      isActive: true,
    },
  });

  return targetContext ? toTargetContextRecord(targetContext) : null;
}

export async function listManualProjectRecords(clerkUserId: string) {
  await ensureProfilesTable();

  const manualProjects = await prisma.manualProject.findMany({
    where: {
      profileId: clerkUserId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return manualProjects.map(toManualProjectRecord);
}

export async function listSourceDocumentRecords(clerkUserId: string) {
  await ensureProfilesTable();

  const sourceDocuments = await prisma.sourceDocument.findMany({
    where: {
      profileId: clerkUserId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return sourceDocuments.map(toSourceDocumentRecord);
}

export async function listResumeVersionRecords(clerkUserId: string) {
  await ensureProfilesTable();

  const resumeVersions = await prisma.resumeVersion.findMany({
    where: {
      profileId: clerkUserId,
    },
    orderBy: {
      version: "desc",
    },
  });

  return resumeVersions.map(toResumeVersionRecord);
}

function getActiveTargetContextId(clerkUserId: string) {
  return `active-target:${clerkUserId}`;
}

function emptyToNull(value: string | undefined) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function getInterviewDate(onboarding: OnboardingSubmission) {
  if (onboarding.noDateYet || !onboarding.interviewDate) {
    return null;
  }

  return new Date(`${onboarding.interviewDate}T00:00:00.000Z`);
}

function getPreparationMinutes(value: OnboardingSubmission["preparationTimePerDay"]) {
  return value === "flexible" ? null : Number(value);
}

function getTechnologies(value: string | undefined) {
  return (
    value
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean) ?? []
  );
}
