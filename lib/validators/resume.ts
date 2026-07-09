import { z } from "zod";

export const ResumeAnalyzeRequestSchema = z.object({
  resumeText: z.string().min(20, "Paste at least 20 characters of resume text."),
  targetRole: z.string().min(2),
  experienceLevel: z.string().min(2),
});

export const ResumeAnalysisSchema = z.object({
  score: z.number(),
  riskLevel: z.enum(["low", "medium", "high"]),
  atsScore: z.number(),
  summary: z.string(),
  criticalIssues: z.array(z.string()),
  weakBullets: z.array(z.object({ before: z.string(), after: z.string() })),
  skillsWithoutProof: z.array(z.string()),
  missingMetrics: z.array(z.string()),
  suggestedBullets: z.array(z.string()),
});
