import { z } from "zod";

export const GenerateQuestionsRequestSchema = z.object({
  projectId: z.string().min(2),
  roundType: z.enum(["resume_screen", "project_deep_dive", "system_design", "behavioral", "hr"]),
  targetRole: z.string().min(2),
});

export const InterviewQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  category: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  expectedPoints: z.array(z.string()),
  followUps: z.array(z.string()),
});

export const GradeAnswerRequestSchema = z.object({
  question: z.string().min(5),
  answer: z.string().min(10, "Give the mock reviewer at least 10 characters."),
  context: z.string().optional(),
});

export const AnswerFeedbackSchema = z.object({
  overallScore: z.number(),
  clarityScore: z.number(),
  technicalDepthScore: z.number(),
  specificityScore: z.number(),
  confidenceScore: z.number(),
  hireSignal: z.enum(["weak", "mixed", "strong"]),
  whatWasGood: z.array(z.string()),
  missingPoints: z.array(z.string()),
  improvedAnswer: z.string(),
  followUpQuestion: z.string(),
  nextPracticeTopics: z.array(z.string()),
});
