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
