import { aiOrchestrator } from "@/lib/ai/ai-orchestrator";
import type { ResumeAnalyzeRequestSchema } from "@/lib/validators/resume";
import type { z } from "zod";

// TODO: Replace mock-ai with OpenAI later.
export async function analyzeResume(_input: z.infer<typeof ResumeAnalyzeRequestSchema>) {
  return aiOrchestrator.analyzeResume();
}
