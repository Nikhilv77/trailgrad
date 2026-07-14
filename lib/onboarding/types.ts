export const onboardingStatuses = [
  "not_started",
  "in_progress",
  "analyzing",
  "completed",
  "failed",
] as const;

export type OnboardingStatus = (typeof onboardingStatuses)[number];

export const onboardingStepIds = [
  "target-role",
  "resume",
  "review",
] as const;

export type OnboardingStepId = (typeof onboardingStepIds)[number];

export interface OnboardingSubmission {
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
