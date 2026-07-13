import { z } from "zod";

const mvpSourceReferenceSchema = z.object({
  sourceType: z.enum(["resume", "job_description", "target_context"]),
  locator: z.string().min(1),
  excerpt: z.string().min(1).max(500),
});

const readinessLevelSchema = z.enum(["LOW", "MEDIUM", "HIGH"]);
const targetAlignmentMismatchLevelSchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const mvpAnalysisSchema = z.object({
  profileSummary: z.string().min(1).max(700),
  targetAlignment: z.object({
    selectedRoleLabel: z.string().min(1).max(120),
    detectedResumeDirection: z.string().min(1).max(160),
    detectedJobDirection: z.string().min(1).max(160).nullable(),
    mismatchLevel: targetAlignmentMismatchLevelSchema,
    shouldAskUserToConfirmTarget: z.boolean(),
    recommendedTarget: z.enum(["selected_role", "job_description"]),
    explanation: z.string().min(1).max(420),
  }),
  strongestSignals: z.array(z.string().min(1).max(220)).length(3),
  rejectionRisks: z
    .array(
      z.object({
        title: z.string().min(1).max(120),
        reason: z.string().min(1).max(360),
        severity: z.enum(["LOW", "MEDIUM", "HIGH"]),
        sourceReference: mvpSourceReferenceSchema,
        likelyQuestion: z.string().min(1).max(240),
        recommendedFix: z.string().min(1).max(260),
      }),
    )
    .length(3),
  resumeSuggestions: z.array(z.string().min(1).max(220)).max(5),
  importantQuestions: z
    .array(
      z.object({
        question: z.string().min(1).max(240),
        difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
        whyAsked: z.string().min(1).max(260),
        relatedSource: mvpSourceReferenceSchema,
        answerFocus: z.string().min(1).max(260),
      }),
    )
    .length(5),
  todayPriority: z.object({
    title: z.string().min(1).max(140),
    reason: z.string().min(1).max(300),
    estimatedMinutes: z.number().int().min(10).max(240),
    steps: z.array(z.string().min(1).max(180)).min(1).max(5),
    expectedImpact: z.string().min(1).max(260),
  }),
  sevenDayPlan: z
    .array(
      z.object({
        day: z.number().int().min(1).max(7),
        title: z.string().min(1).max(140),
        task: z.string().min(1).max(260),
        estimatedMinutes: z.number().int().min(10).max(240),
      }),
    )
    .length(7),
  readiness: z.object({
    applicationReadiness: readinessLevelSchema,
    evidenceStrength: readinessLevelSchema,
    projectDepth: readinessLevelSchema,
    interviewPerformanceStatus: z.literal("NOT_ASSESSED"),
  }),
});

export type MVPAnalysis = z.infer<typeof mvpAnalysisSchema>;
