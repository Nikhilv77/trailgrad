import {
  completeProfileOnboardingRecord,
  getActiveTargetContextRecord,
  getCareerContextRecord,
  getOnboardingStateRecord,
  getOrCreateProfileRecord,
  listManualProjectRecords,
  listResumeVersionRecords,
  listSourceDocumentRecords,
  markOnboardingAnalyzingRecord,
  markOnboardingFailedRecord,
  saveOnboardingDataModelRecord,
  updateOnboardingStepRecord,
} from "@/lib/db/profile-repository";
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

export async function markOnboardingAnalyzing(
  clerkUserId: string,
  onboarding: OnboardingSubmission,
): Promise<TrailgradProfileRecord> {
  return markOnboardingAnalyzingRecord(clerkUserId, onboarding);
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

export async function saveOnboardingDataModel(
  clerkUserId: string,
  onboarding: OnboardingSubmission,
): Promise<void> {
  await saveOnboardingDataModelRecord(clerkUserId, onboarding);
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

  return {
    completed: profile.onboardingStatus === "completed",
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
  const onboarding = profile.onboarding;

  return {
    id: clerkUserId,
    name: identity?.name || "Trailgrad learner",
    email: identity?.email || "",
    careerStage: getCareerStage(onboarding?.experienceLevel),
    targetRole: getTargetRole(onboarding?.targetRole),
    experienceLevel: onboarding?.experienceLevel ?? "",
    interviewTimeline: onboarding?.noDateYet
      ? "No date yet"
      : onboarding?.interviewDate ?? "",
    location: "",
    preferredFeedbackStyle: "Senior Engineer",
  };
}

function getCareerStage(experience: string | undefined): UserProfile["careerStage"] {
  if (experience === "student-new-graduate") {
    return "Student";
  }

  if (experience === "junior") {
    return "Fresher";
  }

  return "Working Professional";
}

function getTargetRole(role: string | undefined): UserProfile["targetRole"] {
  if (role === "frontend-engineer") {
    return "Frontend Engineer";
  }

  if (role === "backend-engineer") {
    return "Backend Engineer";
  }

  if (role === "data-analyst" || role === "data-scientist") {
    return "Data Analyst";
  }

  if (role === "product") {
    return "Product Manager";
  }

  return "AI Engineer";
}
