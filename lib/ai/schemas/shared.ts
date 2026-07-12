import { z } from "zod";

export const sourceReferenceSchema = z.object({
  sourceId: z.string().min(1),
  sourceType: z.enum(["resume", "job_description", "project", "interview", "synthetic_fixture"]),
  locator: z.string().min(1),
  quote: z.string().min(1).max(500).optional(),
});

export const confidenceSchema = z.number().min(0).max(1);

export const evidenceStatusSchema = z.enum([
  "MISSING",
  "CLAIMED",
  "PARTIALLY_SUPPORTED",
  "DEMONSTRATED",
  "INTERVIEW_PROVEN",
]);
