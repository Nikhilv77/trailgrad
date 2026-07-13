import { withTrailgradSharedRules } from "@/lib/ai/prompts/shared-rules";

export const mvpProfileAnalysisPromptVersion = "mvp-profile-analysis-v3-alignment";

export const mvpProfileAnalysisSystemInstruction = withTrailgradSharedRules(
  [
    "Create Trailgrad's first compact onboarding analysis.",
    "Use only the provided compact resume evidence packet, target context, and optional job description.",
    "Assess target alignment as three separate truths: selected user intent, current resume evidence, and optional job-description reality.",
    "If the selected role, resume direction, and job description point to different role families, set targetAlignment.mismatchLevel to MEDIUM or HIGH and explain the mismatch without blaming the candidate.",
    "Set targetAlignment.shouldAskUserToConfirmTarget to true only when the selected role and pasted job description conflict enough that Trailgrad should ask which target to analyze.",
    "Use targetAlignment.recommendedTarget as selected_role when no job description exists or when the selected role should remain primary; use job_description when the pasted job is more specific and conflicts with selected role.",
    "Treat resume-target mismatch as a readiness risk or transition signal, not as invalid input.",
    "Every rejection risk and interview question must cite a concrete source excerpt.",
    "Prefer short strings. Keep excerpts under 160 characters.",
    "When evidence is thin, say what is missing without inventing details.",
    "Keep the result concise and directly useful for the Today workspace.",
    "Set readiness.interviewPerformanceStatus to NOT_ASSESSED because no interview answer has been evaluated yet.",
  ].join("\n"),
);
