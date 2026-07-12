import { randomUUID } from "node:crypto";

import { prisma } from "@/lib/db/prisma";

export async function createAiRunRecord(input: {
  profileId?: string | null;
  analysisJobId?: string | null;
  provider: string;
  operation: string;
  model: string;
  promptVersion: string;
  inputTokens?: number | null;
  outputTokens?: number | null;
  cachedTokens?: number | null;
  estimatedCostUsd: number;
  durationMs: number;
  status: "COMPLETED" | "FAILED";
  usedFallback: boolean;
  safeErrorCode?: string | null;
}) {
  return prisma.aiRun.create({
    data: {
      id: randomUUID(),
      profileId: input.profileId ?? null,
      analysisJobId: input.analysisJobId ?? null,
      provider: input.provider,
      operation: input.operation,
      model: input.model,
      promptVersion: input.promptVersion,
      inputTokens: input.inputTokens ?? null,
      outputTokens: input.outputTokens ?? null,
      cachedTokens: input.cachedTokens ?? null,
      estimatedCostUsd: input.estimatedCostUsd,
      durationMs: input.durationMs,
      status: input.status,
      usedFallback: input.usedFallback,
      safeErrorCode: input.safeErrorCode ?? null,
    },
  });
}
