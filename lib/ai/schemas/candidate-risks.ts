import { z } from "zod";

import { confidenceSchema, sourceReferenceSchema } from "@/lib/ai/schemas/shared";

export const candidateRiskSchema = z.object({
  title: z.string().min(1),
  explanation: z.string().min(1),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  sourceReference: sourceReferenceSchema,
  affectedSkill: z.string().nullable(),
  affectedProject: z.string().nullable(),
  likelyInterviewQuestion: z.string().min(1),
  confidence: confidenceSchema,
});

export const candidateRiskOutputSchema = z.object({
  risks: z.array(candidateRiskSchema),
  uncertaintyNotes: z.array(z.string()).default([]),
});

export type CandidateRiskOutput = z.infer<typeof candidateRiskOutputSchema>;
