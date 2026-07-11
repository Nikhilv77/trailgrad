import { mockDb } from "@/lib/db/mock-db";
import {
  completeProfileOnboardingRecord,
  getOrCreateProfileRecord,
} from "@/lib/db/profile-repository";
import type { UserProfile } from "@/types";

export interface OnboardingSubmission {
  role: string;
  experience: string;
  timeline: string;
  resumeName?: string;
  jdText?: string;
  githubUrl?: string;
  linkedinUrl?: string;
}

export interface TrailgradProfileRecord {
  clerkUserId: string;
  onboardingCompletedAt: string | null;
  onboarding: OnboardingSubmission | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrailgradOnboardingStatus {
  completed: boolean;
  completedAt: string | null;
  profile: TrailgradProfileRecord;
}

export async function getDashboard() {
  return mockDb.dashboard;
}

export async function getOrCreateTrailgradProfile(
  clerkUserId: string,
): Promise<TrailgradProfileRecord> {
  return getOrCreateProfileRecord(clerkUserId);
}

export async function readTrailgradOnboardingStatus(
  clerkUserId: string,
): Promise<TrailgradOnboardingStatus> {
  const profile = await getOrCreateTrailgradProfile(clerkUserId);

  return {
    completed: Boolean(profile.onboardingCompletedAt),
    completedAt: profile.onboardingCompletedAt,
    profile,
  };
}

export async function completeTrailgradOnboarding(
  clerkUserId: string,
  onboarding: OnboardingSubmission,
): Promise<TrailgradProfileRecord> {
  return completeProfileOnboardingRecord(clerkUserId, onboarding);
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
    careerStage: getCareerStage(onboarding?.experience),
    targetRole: getTargetRole(onboarding?.role),
    experienceLevel: onboarding?.experience ?? "",
    interviewTimeline: onboarding?.timeline ?? "",
    location: "",
    preferredFeedbackStyle: "Senior Engineer",
  };
}

function getCareerStage(experience: string | undefined): UserProfile["careerStage"] {
  if (experience === "student") {
    return "Student";
  }

  if (experience === "early") {
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
