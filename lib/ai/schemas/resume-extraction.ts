import { z } from "zod";

import { confidenceSchema, sourceReferenceSchema } from "@/lib/ai/schemas/shared";

export const resumeClaimSchema = z.object({
  claim: z.string().min(1),
  category: z.enum(["experience", "education", "project", "skill", "certification", "achievement"]),
  sourceReference: sourceReferenceSchema,
  confidence: confidenceSchema,
});

export const resumeExtractionSchema = z.object({
  summary: z.string().min(1),
  experiences: z.array(
    z.object({
      organization: z.string().min(1),
      title: z.string().min(1).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      highlights: z.array(z.string()).default([]),
      sourceReference: sourceReferenceSchema,
    }),
  ),
  education: z.array(
    z.object({
      institution: z.string().min(1),
      credential: z.string().min(1),
      date: z.string().optional(),
      sourceReference: sourceReferenceSchema,
    }),
  ),
  projects: z.array(
    z.object({
      name: z.string().min(1),
      description: z.string().min(1),
      technologies: z.array(z.string()).default([]),
      sourceReference: sourceReferenceSchema,
    }),
  ),
  skills: z.array(z.string()).default([]),
  certifications: z.array(
    z.object({
      name: z.string().min(1),
      issuer: z.string().optional(),
      date: z.string().optional(),
      sourceReference: sourceReferenceSchema,
    }),
  ),
  achievements: z.array(
    z.object({
      achievement: z.string().min(1),
      sourceReference: sourceReferenceSchema,
    }),
  ),
  claims: z.array(resumeClaimSchema),
  uncertaintyNotes: z.array(z.string()).default([]),
});

export type ResumeExtraction = z.infer<typeof resumeExtractionSchema>;
