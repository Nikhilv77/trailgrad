import { aiOrchestrator } from "@/lib/ai/ai-orchestrator";
import type { JDAnalyzeRequestSchema, JDMatchRequestSchema } from "@/lib/validators/jd";
import type { z } from "zod";

// TODO: Replace mock-ai with OpenAI later.
export async function analyzeJD(_input: z.infer<typeof JDAnalyzeRequestSchema>) {
  return aiOrchestrator.analyzeJD();
}

export async function compareJD(_input: z.infer<typeof JDMatchRequestSchema>) {
  return aiOrchestrator.compareJD();
}
