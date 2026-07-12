import { withTrailgradSharedRules } from "@/lib/ai/prompts/shared-rules";

export const resumeExtractionSystemInstruction = withTrailgradSharedRules(
  "Extract only evidence explicitly present in the resume text. Keep claims compact, attach source references, and record uncertainty instead of guessing.",
);

export const resumeExtractionPromptVersion = "resume-extraction-v1";
