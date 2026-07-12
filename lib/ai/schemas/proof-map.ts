import { z } from "zod";

import {
  confidenceSchema,
  evidenceStatusSchema,
  sourceReferenceSchema,
} from "@/lib/ai/schemas/shared";

export const proofMapOutputSchema = z.object({
  evidence: z.array(
    z.object({
      claim: z.string().min(1),
      status: evidenceStatusSchema,
      explanation: z.string().min(1),
      sourceReferences: z.array(sourceReferenceSchema).default([]),
      confidence: confidenceSchema,
    }),
  ),
  uncertaintyNotes: z.array(z.string()).default([]),
});

export type ProofMapOutput = z.infer<typeof proofMapOutputSchema>;
