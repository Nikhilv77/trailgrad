import { z } from "zod";

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  summary: z.string(),
  techStack: z.array(z.string()),
  proofScore: z.number(),
  interviewRisk: z.enum(["low", "medium", "high"]),
  missingProof: z.array(z.string()),
  githubUrl: z.string().url().optional(),
});

export const AnalyzeProjectRequestSchema = z.object({
  projectId: z.string().min(2),
});

export const ProjectAnalysisSchema = z.object({
  projectId: z.string(),
  depthScore: z.number(),
  riskLevel: z.enum(["low", "medium", "high"]),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  suggestedProof: z.array(z.string()),
});
