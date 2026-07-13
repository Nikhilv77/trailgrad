import { createHash } from "node:crypto";

import type { OnboardingSubmission } from "@/lib/onboarding/types";

type AnalysisInputFingerprintSource = Pick<
  OnboardingSubmission,
  | "experienceLevel"
  | "interviewDate"
  | "jobDescription"
  | "noDateYet"
  | "preparationIntensity"
  | "preparationTimePerDay"
  | "targetCompany"
  | "targetJobMode"
  | "targetJobTitle"
  | "targetRole"
>;

export function buildAnalysisInputFingerprint(
  onboarding: AnalysisInputFingerprintSource,
) {
  const payload = {
    experienceLevel: normalizeValue(onboarding.experienceLevel),
    interviewDate: onboarding.noDateYet
      ? null
      : normalizeValue(onboarding.interviewDate),
    noDateYet: Boolean(onboarding.noDateYet),
    preparationIntensity: normalizeValue(onboarding.preparationIntensity),
    preparationTimePerDay: normalizeValue(onboarding.preparationTimePerDay),
    targetCompany: normalizeValue(onboarding.targetCompany),
    targetJobMode: onboarding.targetJobMode,
    targetJobTitle: normalizeValue(onboarding.targetJobTitle),
    targetRole: normalizeValue(onboarding.targetRole),
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
