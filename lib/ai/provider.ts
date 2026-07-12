import type { ZodType } from "zod";

import type { AIModelClass } from "@/lib/ai/configuration";

export interface AIResult<T> {
  data: T;
  provider: string;
  model: string;
  inputTokens: number | null;
  outputTokens: number | null;
  cachedTokens: number | null;
  estimatedCostUsd: number;
  durationMs: number;
  finishReason: string | null;
  usedFallback: boolean;
}

export interface TrailgradAIProvider {
  generateStructured<T>(request: {
    operation: string;
    systemInstruction: string;
    content: string;
    schema: ZodType<T>;
    schemaName: string;
    modelClass: AIModelClass;
    promptVersion: string;
    profileId?: string;
    analysisJobId?: string;
    timeoutMs?: number;
  }): Promise<AIResult<T>>;
}
