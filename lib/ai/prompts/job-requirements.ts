import { withTrailgradSharedRules } from "@/lib/ai/prompts/shared-rules";

export const jobRequirementsSystemInstruction = withTrailgradSharedRules(
  "Extract role requirements from the job description. Separate required skills from preferred skills and avoid inferring hidden requirements.",
);

export const jobRequirementsPromptVersion = "job-requirements-v1";
