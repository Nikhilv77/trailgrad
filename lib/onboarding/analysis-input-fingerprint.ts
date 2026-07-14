import { createHash } from "node:crypto";

import type { ApplicationSubmission } from "@/lib/applications/types";

type AnalysisInputFingerprintSource = Pick<
  ApplicationSubmission,
  | "experienceLevel"
  | "applicationDate"
  | "jobDescription"
  | "noDateYet"
  | "preparationIntensity"
  | "preparationTimePerDay"
  | "targetCompany"
  | "targetJobMode"
  | "targetJobTitle"
  | "targetRole"
  | "trailFocus"
>;

export function buildAnalysisInputFingerprint(
  onboarding: AnalysisInputFingerprintSource,
) {
  const payload = {
    experienceLevel: normalizeValue(onboarding.experienceLevel),
    applicationDate: onboarding.noDateYet
      ? null
      : normalizeValue(onboarding.applicationDate),
    noDateYet: Boolean(onboarding.noDateYet),
    preparationIntensity: normalizeValue(onboarding.preparationIntensity),
    preparationTimePerDay: normalizeValue(onboarding.preparationTimePerDay),
    targetCompany: normalizeValue(onboarding.targetCompany),
    targetJobMode: onboarding.targetJobMode,
    targetJobTitle: normalizeValue(onboarding.targetJobTitle),
    targetRole: normalizeValue(onboarding.targetRole),
    trailFocus: onboarding.trailFocus,
    jobDescription:
      onboarding.targetJobMode === "paste"
        ? normalizeLongText(onboarding.jobDescription)
        : null,
  };

  return createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex")
    .slice(0, 16);
}

function normalizeValue(value: string | undefined | null) {
  const normalized = value?.replace(/\s+/g, " ").trim().toLowerCase() ?? "";

  return normalized.length > 0 ? normalized : null;
}

function normalizeLongText(value: string | undefined | null) {
  return normalizeValue(value);
}
