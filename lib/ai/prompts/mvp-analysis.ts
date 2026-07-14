import { withTrailgradSharedRules } from "@/lib/ai/prompts/shared-rules";

export const mvpProfileAnalysisPromptVersion = "mvp-profile-analysis-v4-trail-focus";

export const mvpProfileAnalysisSystemInstruction = withTrailgradSharedRules(
  [
    "Create Trailgrad's first compact onboarding analysis.",
    "Use only the provided compact resume evidence packet, target context, and optional job description or learning context.",
    "Assess target alignment as three separate truths: selected user intent, current resume evidence, and optional target detail reality.",
    "If the selected role, resume direction, and target details point to different role families or learning directions, set targetAlignment.mismatchLevel to MEDIUM or HIGH and explain the mismatch without blaming the candidate.",
    "Set targetAlignment.shouldAskUserToConfirmTarget to true only when the selected role and pasted details conflict enough that Trailgrad should ask which target to analyze.",
    "Use targetAlignment.recommendedTarget as selected_role when no specific details exist or when the selected role should remain primary; use job_description when pasted job or learning details are more specific and conflict with selected role.",
    "For learning trails, targetAlignment.detectedJobDirection may describe the detected learning direction, despite the field name.",
    "Treat resume-target mismatch as a readiness risk or transition signal, not as invalid input.",
    "Every rejection risk and interview question must cite a concrete source excerpt.",
    "Prefer short strings. Keep excerpts under 160 characters.",
    "When evidence is thin, say what is missing without inventing details.",
    "Keep the result concise and directly useful for the Today workspace.",
    "Set readiness.interviewPerformanceStatus to NOT_ASSESSED because no interview answer has been evaluated yet.",
  ].join("\n"),
);
