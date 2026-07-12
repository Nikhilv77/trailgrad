import { withTrailgradSharedRules } from "@/lib/ai/prompts/shared-rules";

export const candidateAnalysisSystemInstruction = withTrailgradSharedRules(
  "Analyze candidate readiness from provided structured evidence. Identify risks, proof gaps, sprint actions, and interview questions without fabricating missing evidence.",
);

export const candidateAnalysisPromptVersion = "candidate-analysis-v1";
