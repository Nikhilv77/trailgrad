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
  "timeline",
  "resume",
  "target-job",
  "projects",
  "review",
] as const;

export type OnboardingStepId = (typeof onboardingStepIds)[number];

export interface OnboardingSubmission {
  targetRole: string;
  experienceLevel: string;
  targetCompany?: string;
  targetJobTitle?: string;
  interviewDate?: string;
  noDateYet?: boolean;
  preparationTimePerDay: "15" | "30" | "60" | "flexible";
  preparationIntensity: "light" | "standard" | "intensive";
  resumeName?: string;
  resumeContentType?: string;
  resumeSize?: number;
  resumeUploadedAt?: string;
  targetJobMode: "paste" | "skip";
  jobDescription?: string;
  projectsMode: "manual" | "github_later" | "skip";
  projectName?: string;
  projectDescription?: string;
  projectTechStack?: string;
}

export interface OnboardingState {
  status: OnboardingStatus;
  currentStep: OnboardingStepId;
  startedAt: string | null;
  completedAt: string | null;
  analysisError: string | null;
  onboarding: OnboardingSubmission | null;
}
