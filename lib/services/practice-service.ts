import { aiOrchestrator } from "@/lib/ai/ai-orchestrator";
import { mockDb } from "@/lib/db/mock-db";

// TODO: Replace mock-db with Supabase later.
export async function getPracticePlan() {
  return aiOrchestrator.practicePlan();
}

export async function getProgress() {
  return mockDb.progress;
}
