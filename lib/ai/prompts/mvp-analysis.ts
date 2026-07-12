import { withTrailgradSharedRules } from "@/lib/ai/prompts/shared-rules";

export const mvpProfileAnalysisPromptVersion = "mvp-profile-analysis-v2-compact";

export const mvpProfileAnalysisSystemInstruction = withTrailgradSharedRules(
  [
    "Create Trailgrad's first compact onboarding analysis.",
    "Use only the provided compact resume evidence packet, target context, and optional job description.",
    "Every rejection risk and interview question must cite a concrete source excerpt.",
    "Prefer short strings. Keep excerpts under 160 characters.",
    "When evidence is thin, say what is missing without inventing details.",
    "Keep the result concise and directly useful for the Today workspace.",
    "Set readiness.interviewPerformanceStatus to NOT_ASSESSED because no interview answer has been evaluated yet.",
  ].join("\n"),
);
