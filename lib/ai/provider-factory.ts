import { getAIConfiguration } from "@/lib/ai/configuration";
import { TrailgradAIError } from "@/lib/ai/errors";
import type { TrailgradAIProvider } from "@/lib/ai/provider";
import { GeminiProvider } from "@/lib/ai/providers/gemini-provider";

let cachedProvider: TrailgradAIProvider | null = null;

export function getAIProvider(): TrailgradAIProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  const configuration = getAIConfiguration();

  if (configuration.provider === "gemini") {
    cachedProvider = new GeminiProvider({ configuration });
    return cachedProvider;
  }

  throw new TrailgradAIError(
    "UNKNOWN_PROVIDER_ERROR",
    `Unsupported AI provider "${configuration.provider}".`,
  );
}

export function resetAIProviderForTests() {
  cachedProvider = null;
}
