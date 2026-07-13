import { z } from "zod";

import { onboardingStatuses, onboardingStepIds } from "@/lib/onboarding/types";

export const onboardingTargetRoles = [
  "ai-engineer",
  "ml-engineer",
  "software-engineer",
  "frontend-engineer",
  "backend-engineer",
  "full-stack-engineer",
  "data-scientist",
  "data-analyst",
  "data-engineer",
  "product",
] as const;

export const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  careerStage: z.enum(["Student", "Fresher", "Working Professional"]),
  targetRole: z.enum(["AI Engineer", "Frontend Engineer", "Backend Engineer", "Data Analyst", "Product Manager"]),
  experienceLevel: z.string(),
  interviewTimeline: z.string(),
  location: z.string(),
  preferredFeedbackStyle: z.enum(["Friendly Coach", "Strict Interviewer", "Senior Engineer", "HR Style"]),
});

const OnboardingSubmissionBaseSchema = z.object({
  targetRole: z.enum(onboardingTargetRoles, {
    message: "Choose a supported target role.",
  }),
  experienceLevel: z.string().trim().min(1, "Choose your current experience level.").max(80),
  targetCompany: z.string().trim().max(120).optional(),
  targetJobTitle: z.string().trim().max(120).optional(),
  interviewDate: z.string().trim().max(20).optional(),
  noDateYet: z.boolean().optional(),
  preparationTimePerDay: z.enum(["15", "30", "60", "flexible"], {
    message: "Choose your daily preparation time.",
  }),
  preparationIntensity: z.enum(["light", "standard", "intensive"], {
    message: "Choose a preparation intensity.",
  }),
  resumeName: z.string().trim().max(255).optional(),
  resumeContentType: z.string().trim().max(120).optional(),
  resumeSize: z.number().optional(),
  resumeUploadedAt: z.string().trim().max(80).optional(),
  targetJobMode: z.enum(["paste", "skip"], {
    message: "Choose whether to add a target job.",
  }),
  jobDescription: z.string().trim().max(12_000).optional(),
  projectsMode: z.enum(["manual", "github_later", "skip"], {
    message: "Choose how you want to handle projects.",
  }),
  projectName: z.string().trim().max(160).optional(),
  projectDescription: z.string().trim().max(2_000).optional(),
  projectTechStack: z.string().trim().max(600).optional(),
});

export const OnboardingSubmissionSchema = OnboardingSubmissionBaseSchema.superRefine((value, context) => {
  if (!value.resumeName) {
    context.addIssue({
      code: "custom",
      message: "Upload a resume before building your Trailgrad profile.",
      path: ["resumeName"],
    });
  }

  if (!value.noDateYet && !value.interviewDate) {
    context.addIssue({
      code: "custom",
      message: "Choose a date or select that you do not have one yet.",
      path: ["interviewDate"],
    });
  }

  if (value.targetJobMode === "paste" && !value.jobDescription?.trim()) {
    context.addIssue({
      code: "custom",
      message: "Paste a job description or choose to skip the target job.",
      path: ["jobDescription"],
    });
  }

  if (value.projectsMode === "manual" && !value.projectName?.trim()) {
    context.addIssue({
      code: "custom",
      message: "Add a project name or choose to skip projects for now.",
      path: ["projectName"],
    });
  }
});

export const OnboardingStatusSchema = z.enum(onboardingStatuses);

export const OnboardingStepSchema = z.enum(onboardingStepIds);

export const PartialOnboardingSubmissionSchema =
  OnboardingSubmissionBaseSchema.partial();

export const OnboardingStepUpdateSchema = z.object({
  currentStep: OnboardingStepSchema,
  onboarding: PartialOnboardingSubmissionSchema,
});
