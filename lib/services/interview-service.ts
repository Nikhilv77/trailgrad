import { aiOrchestrator } from "@/lib/ai/ai-orchestrator";
import type { GenerateQuestionsRequestSchema, GradeAnswerRequestSchema } from "@/lib/validators/interview";
import type { z } from "zod";

// TODO: Replace mock-ai with OpenAI later.
export async function generateQuestions(_input: z.infer<typeof GenerateQuestionsRequestSchema>) {
  return aiOrchestrator.generateQuestions();
}

export async function gradeAnswer(_input: z.infer<typeof GradeAnswerRequestSchema>) {
  return aiOrchestrator.gradeAnswer();
}
