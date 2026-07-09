import { z } from "zod";

export const RejectionReportSchema = z.object({
  overallRisk: z.number(),
  riskLevel: z.enum(["low", "medium", "high"]),
  breakdown: z.array(z.object({ label: z.string(), score: z.number(), level: z.enum(["low", "medium", "high"]) })),
  topReasons: z.array(z.object({
    reason: z.string(),
    whyItMatters: z.string(),
    howToFix: z.string(),
    relatedTasks: z.array(z.string()),
  })),
});
