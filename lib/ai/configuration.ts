import type { AIErrorCode } from "@/lib/ai/errors";
import { TrailgradAIError } from "@/lib/ai/errors";

export type AIProviderName = "gemini";
export type AIDataPolicy = "synthetic_only" | "real_user_data_allowed";
export type AIModelClass = "extraction" | "analysis" | "fallback";

export interface AIConfiguration {
  provider: AIProviderName;
  dataPolicy: AIDataPolicy;
  defaultTimeoutMs: number;
  maxRetries: number;
  monthlyBudgetUsd: number;
  fallbackConfidenceThreshold: number;
  maxOutputTokens: number;
  gemini: {
    apiKey: string | null;
    extractionModel: string;
    analysisModel: string;
    fallbackModel: string;
  };
}

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_RETRIES = 1;
const DEFAULT_MONTHLY_BUDGET_USD = 0;
const DEFAULT_FALLBACK_CONFIDENCE_THRESHOLD = 0.65;
const DEFAULT_MAX_OUTPUT_TOKENS = 4096;

export function getAIConfiguration(
  env: Record<string, string | undefined> = process.env,
): AIConfiguration {
  const provider = parseProvider(env.AI_PROVIDER ?? "gemini");
  const dataPolicy = parseDataPolicy(env.AI_DATA_POLICY ?? "synthetic_only");

  if (dataPolicy === "synthetic_only") {
    warnSyntheticOnly();
  }

  return {
    provider,
    dataPolicy,
    defaultTimeoutMs: parsePositiveInteger(
      env.AI_DEFAULT_TIMEOUT_MS,
      DEFAULT_TIMEOUT_MS,
    ),
    maxRetries: parseNonNegativeInteger(env.AI_MAX_RETRIES, DEFAULT_MAX_RETRIES),
    monthlyBudgetUsd: parseNonNegativeNumber(
      env.AI_MONTHLY_BUDGET_USD,
      DEFAULT_MONTHLY_BUDGET_USD,
    ),
    fallbackConfidenceThreshold: parseNonNegativeNumber(
      env.AI_FALLBACK_CONFIDENCE_THRESHOLD,
      DEFAULT_FALLBACK_CONFIDENCE_THRESHOLD,
    ),
    maxOutputTokens: parsePositiveInteger(
      env.AI_MAX_OUTPUT_TOKENS,
      DEFAULT_MAX_OUTPUT_TOKENS,
    ),
    gemini: {
      apiKey: env.GEMINI_API_KEY ?? null,
      extractionModel: env.GEMINI_EXTRACTION_MODEL ?? "gemini-3.1-flash-lite",
      analysisModel: env.GEMINI_ANALYSIS_MODEL ?? "gemini-3.1-flash-lite",
      fallbackModel: env.GEMINI_FALLBACK_MODEL ?? "gemini-3.5-flash",
    },
  };
}

export function getGeminiModelForClass(
  configuration: AIConfiguration,
  modelClass: AIModelClass,
) {
  if (modelClass === "extraction") {
    return configuration.gemini.extractionModel;
  }

  if (modelClass === "analysis") {
    return configuration.gemini.analysisModel;
  }

  return configuration.gemini.fallbackModel;
}

function parseProvider(value: string): AIProviderName {
  if (value === "gemini") {
    return value;
  }

  throw new TrailgradAIError(
    "UNKNOWN_PROVIDER_ERROR",
    `Unsupported AI_PROVIDER "${value}".`,
  );
}

function parseDataPolicy(value: string): AIDataPolicy {
  if (value === "synthetic_only" || value === "real_user_data_allowed") {
    return value;
  }

  throw new TrailgradAIError(
    "DATA_POLICY_BLOCKED",
    `Unsupported AI_DATA_POLICY "${value}".`,
  );
}

function parsePositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parseNonNegativeInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function parseNonNegativeNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

let syntheticWarningShown = false;

function warnSyntheticOnly() {
  if (syntheticWarningShown) {
    return;
  }

  syntheticWarningShown = true;
  console.warn(
    "[Trailgrad AI] AI_DATA_POLICY=synthetic_only is active. Real candidate resumes, job descriptions, and personal data must not be sent to model providers.",
  );
}

export function aiErrorCodeToStatus(code: AIErrorCode) {
  return code;
}
