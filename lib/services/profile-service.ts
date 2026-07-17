import {
  completeProfileOnboardingRecord,
  getActiveTargetContextRecord,
  getCareerContextRecord,
  getOnboardingStateRecord,
  getOrCreateProfileRecord,
  listManualProjectRecords,
  listResumeVersionRecords,
  listSourceDocumentRecords,
  markOnboardingFailedRecord,
  updateProfileDefaultsRecord,
  updateOnboardingStepRecord,
} from "@/lib/db/profile-repository";
import { listJobApplicationRecords } from "@/lib/db/application-repository";
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
import { OnboardingSubmissionSchema } from "@/lib/validators/profile";
import type { UserProfile } from "@/types";

export type {
  OnboardingState,
  OnboardingStatus,
  OnboardingStepId,
  OnboardingSubmission,
} from "@/lib/onboarding/types";

export interface TrailgradProfileRecord {
  clerkUserId: string;
  onboardingStatus: OnboardingStatus;
  currentOnboardingStep: OnboardingStepId;
  onboardingStartedAt: string | null;
  onboardingCompletedAt: string | null;
  analysisError: string | null;
  onboarding: OnboardingSubmission | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrailgradOnboardingStatus {
  completed: boolean;
  completedAt: string | null;
  profile: TrailgradProfileRecord;
}

export async function getOrCreateProfile(
  clerkUserId: string,
): Promise<TrailgradProfileRecord> {
  return getOrCreateProfileRecord(clerkUserId);
}

export async function getOnboardingState(
  clerkUserId: string,
): Promise<OnboardingState> {
  return getOnboardingStateRecord(clerkUserId);
}

export async function updateOnboardingStep(
  clerkUserId: string,
  currentStep: OnboardingStepId,
  onboarding: Partial<OnboardingSubmission>,
): Promise<TrailgradProfileRecord> {
  return updateOnboardingStepRecord(clerkUserId, currentStep, onboarding);
}

export async function updateProfileDefaults(
  clerkUserId: string,
  input: {
    targetRole: string;
    experienceLevel: string;
  },
): Promise<CareerContextRecord> {
  return updateProfileDefaultsRecord(clerkUserId, input);
}

export async function markOnboardingCompleted(
  clerkUserId: string,
  onboarding: OnboardingSubmission,
): Promise<TrailgradProfileRecord> {
  return completeProfileOnboardingRecord(clerkUserId, onboarding);
}

export async function markOnboardingFailed(
  clerkUserId: string,
  analysisError: string,
): Promise<TrailgradProfileRecord> {
  return markOnboardingFailedRecord(clerkUserId, analysisError);
}

export async function getCareerContext(
  clerkUserId: string,
): Promise<CareerContextRecord | null> {
  return getCareerContextRecord(clerkUserId);
}

export async function getActiveTargetContext(
  clerkUserId: string,
): Promise<TargetContextRecord | null> {
  return getActiveTargetContextRecord(clerkUserId);
}

export async function listManualProjects(
  clerkUserId: string,
): Promise<ManualProjectRecord[]> {
  return listManualProjectRecords(clerkUserId);
}

export async function listSourceDocuments(
  clerkUserId: string,
): Promise<SourceDocumentRecord[]> {
  return listSourceDocumentRecords(clerkUserId);
}

export async function listResumeVersions(
  clerkUserId: string,
): Promise<ResumeVersionRecord[]> {
  return listResumeVersionRecords(clerkUserId);
}

export async function getOrCreateTrailgradProfile(
  clerkUserId: string,
): Promise<TrailgradProfileRecord> {
  return getOrCreateProfile(clerkUserId);
}

export async function readTrailgradOnboardingStatus(
  clerkUserId: string,
): Promise<TrailgradOnboardingStatus> {
  const profile = await getOrCreateProfile(clerkUserId);
  const hasCompletedOnboardingPayload =
    profile.onboardingStatus === "completed" &&
    OnboardingSubmissionSchema.safeParse(profile.onboarding).success;
  const hasTrail =
    hasCompletedOnboardingPayload &&
    (await listJobApplicationRecords(clerkUserId)).length > 0;

  return {
    completed: hasCompletedOnboardingPayload && hasTrail,
    completedAt: profile.onboardingCompletedAt,
    profile,
  };
}

export async function completeTrailgradOnboarding(
  clerkUserId: string,
  onboarding: OnboardingSubmission,
): Promise<TrailgradProfileRecord> {
  return markOnboardingCompleted(clerkUserId, onboarding);
}

export function toUserProfile(
  clerkUserId: string,
  profile: TrailgradProfileRecord,
  identity?: {
    name?: string | null;
    email?: string | null;
  },
): UserProfile {
  void profile;

  return {
    id: clerkUserId,
    name: identity?.name || "Trailgrad learner",
    email: identity?.email || "",
    careerStage: "Working Professional",
    targetRole: "AI Engineer",
    experienceLevel: "",
    interviewTimeline: "",
    location: "",
    preferredFeedbackStyle: "Senior Engineer",
  };
}
