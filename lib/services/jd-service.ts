import { aiOrchestrator } from "@/lib/ai/ai-orchestrator";
import type { JDAnalyzeRequestSchema, JDMatchRequestSchema } from "@/lib/validators/jd";
import type { z } from "zod";

// TODO: Replace mock-ai with OpenAI later.
export async function analyzeJD(input: z.infer<typeof JDAnalyzeRequestSchema>) {
  void input;
  return aiOrchestrator.analyzeJD();
}

export async function compareJD(input: z.infer<typeof JDMatchRequestSchema>) {
  void input;
  return aiOrchestrator.compareJD();
}
