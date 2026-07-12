import { z } from "zod";

export const sprintPlanSchema = z.object({
  title: z.string().min(1),
  outcome: z.string().min(1),
  duration: z.string().min(1),
  intensity: z.enum(["LIGHT", "STANDARD", "INTENSIVE"]),
  tasks: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      estimatedMinutes: z.number().int().positive(),
      affectedEvidenceOrSkill: z.string().min(1),
    }),
  ),
});

export type SprintPlan = z.infer<typeof sprintPlanSchema>;
