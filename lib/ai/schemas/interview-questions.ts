import { z } from "zod";

import { sourceReferenceSchema } from "@/lib/ai/schemas/shared";

export const interviewQuestionSchema = z.object({
  question: z.string().min(1),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  questionType: z.enum(["BEHAVIORAL", "TECHNICAL", "PROJECT_DEEP_DIVE", "SYSTEM_DESIGN", "ROLE_SPECIFIC"]),
  competency: z.string().min(1),
  whySelected: z.string().min(1),
  expectedEvidence: z.array(z.string()).default([]),
  sourceReference: sourceReferenceSchema,
  likelyFollowUps: z.array(z.string()).default([]),
});

export const interviewQuestionSetSchema = z.object({
  queues: z.object({
    MUST_ANSWER: z.array(interviewQuestionSchema).default([]),
    LIKELY: z.array(interviewQuestionSchema).default([]),
    STRETCH: z.array(interviewQuestionSchema).default([]),
  }),
});

export type InterviewQuestionSet = z.infer<typeof interviewQuestionSetSchema>;
