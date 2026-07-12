import { GoogleGenAI } from "@google/genai";
import { z, type ZodType } from "zod";

import {
  getAIConfiguration,
  getGeminiModelForClass,
  type AIConfiguration,
  type AIModelClass,
} from "@/lib/ai/configuration";
import { estimateAICostUsd, assertWithinMonthlyAIBudget } from "@/lib/ai/cost";
import { assertAIDataPolicyAllowsContent } from "@/lib/ai/data-policy";
import { TrailgradAIError, toSafeAIError } from "@/lib/ai/errors";
import type { AIResult, TrailgradAIProvider } from "@/lib/ai/provider";
import { redactModelBoundText } from "@/lib/ai/redaction";
import { createAiRunRecord } from "@/lib/db/ai-run-repository";

export interface GeminiLikeClient {
  models: {
    generateContent: (params: {
      model: string;
      contents: string;
      config: Record<string, unknown>;
    }) => Promise<GeminiLikeResponse>;
  };
}

interface GeminiLikeResponse {
  text?: string;
  modelVersion?: string;
  candidates?: Array<{
    finishReason?: string;
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    cachedContentTokenCount?: number;
  };
}

interface GeminiStructuredAttempt<T> {
  data: T;
  model: string;
  inputTokens: number | null;
  outputTokens: number | null;
  cachedTokens: number | null;
  estimatedCostUsd: number;
  durationMs: number;
  finishReason: string | null;
}

export class GeminiProvider implements TrailgradAIProvider {
  private readonly client: GeminiLikeClient;
  private readonly configuration: AIConfiguration;

  constructor(options: {
    client?: GeminiLikeClient;
    configuration?: AIConfiguration;
  } = {}) {
    this.configuration = options.configuration ?? getAIConfiguration();

    if (!this.configuration.gemini.apiKey && !options.client) {
      throw new TrailgradAIError(
        "AUTHENTICATION_ERROR",
        "GEMINI_API_KEY is required for the Gemini AI provider.",
        false,
      );
    }

    this.client =
      options.client ??
      new GoogleGenAI({
        apiKey: this.configuration.gemini.apiKey ?? "",
      });
  }

  async generateStructured<T>(request: {
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
  }): Promise<AIResult<T>> {
    const startedAt = Date.now();
    let usedFallback = false;
    let lastModel = getGeminiModelForClass(this.configuration, request.modelClass);
    let tokenSnapshot: {
      inputTokens: number | null;
      outputTokens: number | null;
      cachedTokens: number | null;
    } = emptyTokenSnapshot();

    try {
      assertAIDataPolicyAllowsContent({
        configuration: this.configuration,
        content: request.content,
      });
      await assertWithinMonthlyAIBudget({
        monthlyBudgetUsd: this.configuration.monthlyBudgetUsd,
      });

      const primaryModel = getGeminiModelForClass(
        this.configuration,
        request.modelClass,
      );
      const fallbackModel = getGeminiModelForClass(this.configuration, "fallback");
      const maxAttempts = Math.max(1, this.configuration.maxRetries + 2);
      let attempts = 0;
      let primaryInvalidRetryUsed = false;
      let lastError: TrailgradAIError | null = null;

      while (attempts < maxAttempts) {
        const model = usedFallback ? fallbackModel : primaryModel;
        lastModel = model;
        attempts += 1;

        try {
          const attempt = await this.generateWithModel({
            ...request,
            content: redactModelBoundText(request.content),
            model,
          });
          tokenSnapshot = attempt;

          if (
            !usedFallback &&
            shouldEscalateToFallback(attempt.data, this.configuration)
          ) {
            if (attempts >= maxAttempts) {
              throw new TrailgradAIError(
                "INVALID_STRUCTURED_OUTPUT",
                "AI output required fallback but the attempt limit was reached.",
                true,
              );
            }

            usedFallback = true;
            continue;
          }

          const result = {
            data: attempt.data,
            provider: "gemini",
            model,
            inputTokens: attempt.inputTokens,
            outputTokens: attempt.outputTokens,
            cachedTokens: attempt.cachedTokens,
            estimatedCostUsd: attempt.estimatedCostUsd,
            durationMs: Date.now() - startedAt,
            finishReason: attempt.finishReason,
            usedFallback,
          };

          await logAiRun({
            request,
            result,
            status: "COMPLETED",
          });

          return result;
        } catch (error) {
          const safeError = toSafeAIError(error);
          lastError = safeError;

          if (!isRetryableByPolicy(safeError)) {
            throw safeError;
          }

          if (
            safeError.code === "INVALID_STRUCTURED_OUTPUT" &&
            !primaryInvalidRetryUsed &&
            !usedFallback
          ) {
            primaryInvalidRetryUsed = true;
            continue;
          }

          if (
            safeError.code === "INVALID_STRUCTURED_OUTPUT" &&
            !usedFallback &&
            attempts < maxAttempts
          ) {
            usedFallback = true;
            continue;
          }

          if (attempts >= maxAttempts) {
            throw safeError;
          }
        }
      }

      throw (
        lastError ??
        new TrailgradAIError(
          "UNKNOWN_PROVIDER_ERROR",
          "Trailgrad could not complete the AI request.",
          true,
        )
      );
    } catch (error) {
      const safeError = toSafeAIError(error);
      const estimatedCostUsd = estimateAICostUsd({
        model: lastModel,
        inputTokens: tokenSnapshot.inputTokens,
        outputTokens: tokenSnapshot.outputTokens,
        cachedTokens: tokenSnapshot.cachedTokens,
      });

      await createAiRunRecord({
        profileId: request.profileId ?? null,
        analysisJobId: request.analysisJobId ?? null,
        provider: "gemini",
        operation: request.operation,
        model: lastModel,
        promptVersion: request.promptVersion,
        inputTokens: tokenSnapshot.inputTokens,
        outputTokens: tokenSnapshot.outputTokens,
        cachedTokens: tokenSnapshot.cachedTokens,
        estimatedCostUsd,
        durationMs: Date.now() - startedAt,
        status: "FAILED",
        usedFallback,
        safeErrorCode: safeError.code,
      });

      throw safeError;
    }
  }

  private async generateWithModel<T>(
    request: {
      operation: string;
      systemInstruction: string;
      content: string;
      schema: ZodType<T>;
      schemaName: string;
      modelClass: AIModelClass;
      promptVersion: string;
      timeoutMs?: number;
    } & { model: string },
  ): Promise<GeminiStructuredAttempt<T>> {
    const startedAt = Date.now();
    const timeoutMs = request.timeoutMs ?? this.configuration.defaultTimeoutMs;
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), timeoutMs);

    try {
      const response = await this.client.models.generateContent({
        model: request.model,
        contents: request.content,
        config: {
          systemInstruction: request.systemInstruction,
          responseMimeType: "application/json",
          responseSchema: toGeminiResponseSchema(request.schema, request.schemaName),
          maxOutputTokens: this.configuration.maxOutputTokens,
          abortSignal: abortController.signal,
        },
      });
      const parsedJson = parseJsonResponse(response.text);
      const parsed = request.schema.safeParse(parsedJson);

      if (!parsed.success) {
        throw new TrailgradAIError(
          "INVALID_STRUCTURED_OUTPUT",
          "The AI provider returned structured output that did not match Trailgrad's schema.",
          true,
        );
      }

      const inputTokens = response.usageMetadata?.promptTokenCount ?? null;
      const outputTokens = response.usageMetadata?.candidatesTokenCount ?? null;
      const cachedTokens = response.usageMetadata?.cachedContentTokenCount ?? null;

      return {
        data: parsed.data,
        model: response.modelVersion ?? request.model,
        inputTokens,
        outputTokens,
        cachedTokens,
        estimatedCostUsd: estimateAICostUsd({
          model: request.model,
          inputTokens,
          outputTokens,
          cachedTokens,
        }),
        durationMs: Date.now() - startedAt,
        finishReason: response.candidates?.[0]?.finishReason ?? null,
      };
    } catch (error) {
      throw mapGeminiError(error);
    } finally {
      clearTimeout(timeout);
    }
  }
}

function toGeminiResponseSchema<T>(schema: ZodType<T>, schemaName: string) {
  const jsonSchema = z.toJSONSchema(schema) as Record<string, unknown>;

  return {
    ...jsonSchema,
    title: schemaName,
  };
}

function parseJsonResponse(text: string | undefined) {
  if (!text) {
    throw new TrailgradAIError(
      "INVALID_STRUCTURED_OUTPUT",
      "The AI provider returned an empty structured response.",
      true,
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new TrailgradAIError(
      "INVALID_STRUCTURED_OUTPUT",
      "The AI provider returned invalid JSON.",
      true,
    );
  }
}

function shouldEscalateToFallback<T>(
  data: T,
  configuration: AIConfiguration,
) {
  return (
    hasLowConfidence(data, configuration.fallbackConfidenceThreshold) ||
    hasConflictingEvidence(data)
  );
}

function hasLowConfidence(value: unknown, threshold: number): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }

  if (
    "confidence" in value &&
    typeof value.confidence === "number" &&
    value.confidence < threshold
  ) {
    return true;
  }

  return Object.values(value).some((item) => {
    if (Array.isArray(item)) {
      return item.some((entry) => hasLowConfidence(entry, threshold));
    }

    return hasLowConfidence(item, threshold);
  });
}

function hasConflictingEvidence(value: unknown): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }

  if ("conflictingEvidence" in value && value.conflictingEvidence === true) {
    return true;
  }

  if (
    "uncertaintyNotes" in value &&
    Array.isArray(value.uncertaintyNotes) &&
    value.uncertaintyNotes.some(
      (note) => typeof note === "string" && /conflict|contradict/i.test(note),
    )
  ) {
    return true;
  }

  return Object.values(value).some((item) => {
    if (Array.isArray(item)) {
      return item.some(hasConflictingEvidence);
    }

    return hasConflictingEvidence(item);
  });
}

function isRetryableByPolicy(error: TrailgradAIError) {
  return error.code === "INVALID_STRUCTURED_OUTPUT";
}

function mapGeminiError(error: unknown): TrailgradAIError {
  if (error instanceof TrailgradAIError) {
    return error;
  }

  if (error instanceof Error && error.name === "AbortError") {
    return new TrailgradAIError("TIMEOUT", "The AI request timed out.", true);
  }

  const message = error instanceof Error ? error.message : String(error);
  const status = getErrorStatus(error);

  if (status === 401 || status === 403 || /api key|permission/i.test(message)) {
    return new TrailgradAIError(
      "AUTHENTICATION_ERROR",
      "The AI provider rejected Trailgrad authentication.",
      false,
    );
  }

  if (status === 429 || /rate limit|quota/i.test(message)) {
    return new TrailgradAIError(
      "RATE_LIMITED",
      "The AI provider rate limit was reached.",
      true,
    );
  }

  if (status === 400 && /token|too large|context/i.test(message)) {
    return new TrailgradAIError(
      "INPUT_TOO_LARGE",
      "The AI request input was too large.",
      false,
    );
  }

  if (/safety|blocked/i.test(message)) {
    return new TrailgradAIError(
      "SAFETY_BLOCKED",
      "The AI provider blocked the request for safety reasons.",
      false,
    );
  }

  if (status && status >= 500) {
    return new TrailgradAIError(
      "PROVIDER_UNAVAILABLE",
      "The AI provider is temporarily unavailable.",
      true,
    );
  }

  return new TrailgradAIError(
    "UNKNOWN_PROVIDER_ERROR",
    "Trailgrad could not complete the AI request.",
    true,
  );
}

function getErrorStatus(error: unknown) {
  if (error && typeof error === "object" && "status" in error) {
    const status = Number(error.status);

    return Number.isInteger(status) ? status : null;
  }

  return null;
}

function emptyTokenSnapshot() {
  return {
    inputTokens: null,
    outputTokens: null,
    cachedTokens: null,
  };
}

async function logAiRun<T>(input: {
  request: {
    operation: string;
    promptVersion: string;
    profileId?: string;
    analysisJobId?: string;
  };
  result: AIResult<T>;
  status: "COMPLETED";
}) {
  await createAiRunRecord({
    profileId: input.request.profileId ?? null,
    analysisJobId: input.request.analysisJobId ?? null,
    provider: input.result.provider,
    operation: input.request.operation,
    model: input.result.model,
    promptVersion: input.request.promptVersion,
    inputTokens: input.result.inputTokens,
    outputTokens: input.result.outputTokens,
    cachedTokens: input.result.cachedTokens,
    estimatedCostUsd: input.result.estimatedCostUsd,
    durationMs: input.result.durationMs,
    status: input.status,
    usedFallback: input.result.usedFallback,
    safeErrorCode: null,
  });
}

export const geminiProviderTestInternals = {
  hasConflictingEvidence,
  hasLowConfidence,
  mapGeminiError,
};
