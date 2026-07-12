import { z } from "zod";

export const initialReadinessOutputSchema = z.object({
  applicationReadiness: z.enum(["LOW", "MEDIUM", "HIGH"]),
  evidenceStrength: z.enum(["LOW", "MEDIUM", "HIGH"]),
  projectDepth: z.enum(["LOW", "MEDIUM", "HIGH"]),
  interviewPerformanceStatus: z.enum([
    "NOT_ASSESSED",
    "NEEDS_PRACTICE",
    "DEVELOPING",
    "STRONG",
  ]),
  notes: z.array(z.string()).default([]),
});

export type InitialReadinessOutput = z.infer<typeof initialReadinessOutputSchema>;
