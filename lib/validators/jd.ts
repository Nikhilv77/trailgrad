import { z } from "zod";

export const JDAnalyzeRequestSchema = z.object({
  jdText: z.string().min(20, "Paste at least 20 characters of job description text."),
  targetRole: z.string().min(2),
});

export const JDMatchRequestSchema = z.object({
  resumeId: z.string().min(2),
  jdText: z.string().min(20),
  targetRole: z.string().min(2),
});

export const JDAnalysisSchema = z.object({
  role: z.string(),
  seniority: z.string(),
  requiredSkills: z.array(z.string()),
  responsibilities: z.array(z.string()),
  hiddenSignals: z.array(z.string()),
  interviewThemes: z.array(z.string()),
});

export const JDMatchSchema = z.object({
  matchScore: z.number(),
  strongMatches: z.array(z.string()),
  weakMatches: z.array(z.string()),
  missingProof: z.array(z.string()),
  rejectionRisks: z.array(z.string()),
  recommendedNextSteps: z.array(z.string()),
});
