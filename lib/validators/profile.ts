import { z } from "zod";

import { onboardingStatuses, onboardingStepIds } from "@/lib/onboarding/types";

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
  targetRole: z.string().min(1, "Choose a target role."),
  experienceLevel: z.string().min(1, "Choose your current experience level."),
  targetCompany: z.string().optional(),
  targetJobTitle: z.string().optional(),
  interviewDate: z.string().optional(),
  noDateYet: z.boolean().optional(),
  preparationTimePerDay: z.enum(["15", "30", "60", "flexible"], {
    message: "Choose your daily preparation time.",
  }),
  preparationIntensity: z.enum(["light", "standard", "intensive"], {
    message: "Choose a preparation intensity.",
  }),
  resumeName: z.string().optional(),
  resumeContentType: z.string().optional(),
  resumeSize: z.number().optional(),
  resumeUploadedAt: z.string().optional(),
  targetJobMode: z.enum(["paste", "skip"], {
    message: "Choose whether to add a target job.",
  }),
  jobDescription: z.string().optional(),
  projectsMode: z.enum(["manual", "github_later", "skip"], {
    message: "Choose how you want to handle projects.",
  }),
  projectName: z.string().optional(),
  projectDescription: z.string().optional(),
  projectTechStack: z.string().optional(),
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
