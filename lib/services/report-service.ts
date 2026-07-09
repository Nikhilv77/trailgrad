import { aiOrchestrator } from "@/lib/ai/ai-orchestrator";

// TODO: Replace mock-ai with OpenAI later.
export async function getRejectionReport() {
  return aiOrchestrator.rejectionReport();
}
