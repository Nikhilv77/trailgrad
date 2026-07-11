import { z } from "zod";

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

export const OnboardingSubmissionSchema = z.object({
  role: z.string().min(1, "Choose a target role."),
  experience: z.string().min(1, "Choose your current experience level."),
  timeline: z.string().min(1, "Choose your interview timeline."),
  resumeName: z.string().optional(),
  jdText: z.string().optional(),
  githubUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
});
