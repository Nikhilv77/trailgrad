import { prisma } from "@/lib/db/prisma";
import { TrailgradAIError } from "@/lib/ai/errors";

export interface ModelPrice {
  inputPerMillionTokensUsd: number;
  outputPerMillionTokensUsd: number;
  cachedInputPerMillionTokensUsd?: number;
  freeTierCostOverrideUsd?: number;
}

export const aiModelPrices: Record<string, ModelPrice> = {
  "gemini-3.1-flash-lite": {
    inputPerMillionTokensUsd: 0,
    outputPerMillionTokensUsd: 0,
    cachedInputPerMillionTokensUsd: 0,
    freeTierCostOverrideUsd: 0,
  },
  "gemini-3.5-flash": {
    inputPerMillionTokensUsd: 0,
    outputPerMillionTokensUsd: 0,
    cachedInputPerMillionTokensUsd: 0,
    freeTierCostOverrideUsd: 0,
  },
  "gemini-flash-latest": {
    inputPerMillionTokensUsd: 0,
    outputPerMillionTokensUsd: 0,
    cachedInputPerMillionTokensUsd: 0,
    freeTierCostOverrideUsd: 0,
  },
  "gemini-2.5-flash-lite": {
    inputPerMillionTokensUsd: 0.1,
    outputPerMillionTokensUsd: 0.4,
    cachedInputPerMillionTokensUsd: 0.025,
    freeTierCostOverrideUsd: 0,
  },
  "gemini-2.5-flash": {
    inputPerMillionTokensUsd: 0.3,
    outputPerMillionTokensUsd: 2.5,
    cachedInputPerMillionTokensUsd: 0.075,
    freeTierCostOverrideUsd: 0,
  },
  default: {
    inputPerMillionTokensUsd: 0,
    outputPerMillionTokensUsd: 0,
    cachedInputPerMillionTokensUsd: 0,
    freeTierCostOverrideUsd: 0,
  },
};

export function estimateAICostUsd(input: {
  model: string;
  inputTokens?: number | null;
  outputTokens?: number | null;
  cachedTokens?: number | null;
}) {
  const price = aiModelPrices[input.model] ?? aiModelPrices.default;

  if (price.freeTierCostOverrideUsd !== undefined) {
    return price.freeTierCostOverrideUsd;
  }

  const billableInputTokens = Math.max(
    (input.inputTokens ?? 0) - (input.cachedTokens ?? 0),
    0,
  );
  const cachedTokens = input.cachedTokens ?? 0;
  const outputTokens = input.outputTokens ?? 0;

  return roundCurrency(
    (billableInputTokens / 1_000_000) * price.inputPerMillionTokensUsd +
      (cachedTokens / 1_000_000) *
        (price.cachedInputPerMillionTokensUsd ?? price.inputPerMillionTokensUsd) +
      (outputTokens / 1_000_000) * price.outputPerMillionTokensUsd,
  );
}

export async function assertWithinMonthlyAIBudget(input: {
  monthlyBudgetUsd: number;
  estimatedNextCostUsd?: number;
}) {
  if (input.monthlyBudgetUsd <= 0) {
    return;
  }

  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);

  const aggregate = await prisma.aiRun.aggregate({
    where: {
      createdAt: {
        gte: startOfMonth,
      },
    },
    _sum: {
      estimatedCostUsd: true,
    },
  });
  const used = Number(aggregate._sum.estimatedCostUsd ?? 0);

  if (used + (input.estimatedNextCostUsd ?? 0) > input.monthlyBudgetUsd) {
    throw new TrailgradAIError(
      "BUDGET_EXCEEDED",
      "The configured monthly AI budget has been reached.",
      false,
    );
  }
}

function roundCurrency(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000;
}
