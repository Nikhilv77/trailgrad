import { aiOrchestrator } from "@/lib/ai/ai-orchestrator";
import type { GenerateQuestionsRequestSchema, GradeAnswerRequestSchema } from "@/lib/validators/interview";
import type { z } from "zod";

// TODO: Replace mock-ai with OpenAI later.
export async function generateQuestions(input: z.infer<typeof GenerateQuestionsRequestSchema>) {
  void input;
  return aiOrchestrator.generateQuestions();
}

export async function gradeAnswer(input: z.infer<typeof GradeAnswerRequestSchema>) {
  void input;
  return aiOrchestrator.gradeAnswer();
}
