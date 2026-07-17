import type { ApplicationSubmission } from "@/lib/applications/types";

export const onboardingStatuses = [
  "not_started",
  "in_progress",
  "analyzing",
  "completed",
  "failed",
] as const;

export type OnboardingStatus = (typeof onboardingStatuses)[number];

export const onboardingStepIds = [
  "trail",
  "resume",
] as const;

export type OnboardingStepId = (typeof onboardingStepIds)[number];

export const legacyOnboardingStepIds = [
  "target-role",
  "confirm",
  "review",
] as const;

export type LegacyOnboardingStepId = (typeof legacyOnboardingStepIds)[number];

export function normalizeOnboardingStepId(
  stepId: string | null | undefined,
): OnboardingStepId {
  if (stepId === "resume") {
    return "resume";
  }

  if (stepId === "target-role" || stepId === "trail") {
    return "trail";
  }

  if (stepId === "confirm" || stepId === "review") {
    return "resume";
  }

  return "trail";
}

export interface OnboardingSubmission
  extends Partial<Omit<ApplicationSubmission, "targetRole" | "experienceLevel">> {
  targetRole: string;
  experienceLevel: string;
  resumeName?: string;
  resumeContentType?: string;
  resumeSize?: number;
  resumeUploadedAt?: string;
}

export interface OnboardingState {
  status: OnboardingStatus;
  currentStep: OnboardingStepId;
  startedAt: string | null;
  completedAt: string | null;
  analysisError: string | null;
  onboarding: OnboardingSubmission | null;
}
