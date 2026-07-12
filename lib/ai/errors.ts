export type AIErrorCode =
  | "AUTHENTICATION_ERROR"
  | "DATA_POLICY_BLOCKED"
  | "RATE_LIMITED"
  | "PROVIDER_UNAVAILABLE"
  | "TIMEOUT"
  | "INVALID_STRUCTURED_OUTPUT"
  | "INPUT_TOO_LARGE"
  | "SAFETY_BLOCKED"
  | "BUDGET_EXCEEDED"
  | "UNKNOWN_PROVIDER_ERROR";

export class TrailgradAIError extends Error {
  constructor(
    readonly code: AIErrorCode,
    message: string,
    readonly retryable = false,
  ) {
    super(message);
    this.name = "TrailgradAIError";
  }
}

export function toSafeAIError(error: unknown): TrailgradAIError {
  if (error instanceof TrailgradAIError) {
    return error;
  }

  if (error instanceof Error && error.name === "AbortError") {
    return new TrailgradAIError("TIMEOUT", "The AI request timed out.", true);
  }

  return new TrailgradAIError(
    "UNKNOWN_PROVIDER_ERROR",
    "Trailgrad could not complete the AI request.",
    true,
  );
}
