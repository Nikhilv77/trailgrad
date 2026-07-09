import { z } from "zod";

export const PracticePlanSchema = z.object({
  days: z.array(z.object({
    day: z.number(),
    theme: z.string(),
    tasks: z.array(z.object({
      id: z.string(),
      title: z.string(),
      detail: z.string(),
      area: z.string(),
      completed: z.boolean(),
    })),
  })),
});
