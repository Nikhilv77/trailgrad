import { z } from "zod";

export const jobRequirementExtractionSchema = z.object({
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  expectedSeniority: z.string().min(1),
  competencies: z.array(z.string()).default([]),
  projectExpectations: z.array(z.string()).default([]),
  likelyInterviewAreas: z.array(z.string()).default([]),
});

export type JobRequirementExtraction = z.infer<
  typeof jobRequirementExtractionSchema
>;
