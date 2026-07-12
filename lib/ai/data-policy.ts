import type { AIConfiguration } from "@/lib/ai/configuration";
import { TrailgradAIError } from "@/lib/ai/errors";

const SYNTHETIC_MARKERS = [
  "TRAILGRAD_SYNTHETIC_FIXTURE",
  "synthetic development fixture",
  "fictional candidate",
  "fictional company",
];

const REAL_DATA_SIGNALS = [
  /\bresume\b/i,
  /\bcurriculum vitae\b/i,
  /\bjob description\b/i,
  /\blinkedin\.com\/in\//i,
  /\bgithub\.com\/[A-Za-z0-9-]+/i,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}\b/,
];

export function assertAIDataPolicyAllowsContent(input: {
  configuration: AIConfiguration;
  content: string;
}) {
  if (input.configuration.dataPolicy === "real_user_data_allowed") {
    return;
  }

  const hasSyntheticMarker = SYNTHETIC_MARKERS.some((marker) =>
    input.content.toLowerCase().includes(marker.toLowerCase()),
  );

  if (hasSyntheticMarker) {
    return;
  }

  const looksLikeCandidateData = REAL_DATA_SIGNALS.some((pattern) =>
    pattern.test(input.content),
  );

  if (looksLikeCandidateData || input.content.trim().length > 0) {
    throw new TrailgradAIError(
      "DATA_POLICY_BLOCKED",
      "AI_DATA_POLICY=synthetic_only blocks sending real candidate or job data to model providers. Use an explicit synthetic development fixture or set AI_DATA_POLICY=real_user_data_allowed intentionally.",
      false,
    );
  }
}
