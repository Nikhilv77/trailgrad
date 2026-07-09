import { mockAnswerFeedback, mockQuestions } from "@/lib/mock/interview";
import { mockJdAnalysis, mockJdMatch } from "@/lib/mock/jd";
import { mockProjectAnalysis } from "@/lib/mock/projects";
import { mockRejectionReport } from "@/lib/mock/reports";
import { mockResumeAnalysis } from "@/lib/mock/resume";
import { mockPracticePlan } from "@/lib/mock/practice";

// TODO: Replace mock-ai with OpenAI later. Keep prompt inputs and structured outputs stable.
export const mockAI = {
  analyzeResume: async () => mockResumeAnalysis,
  analyzeJD: async () => mockJdAnalysis,
  compareJD: async () => mockJdMatch,
  analyzeProject: async () => mockProjectAnalysis,
  generateQuestions: async () => ({ questions: mockQuestions }),
  gradeAnswer: async () => mockAnswerFeedback,
  rejectionReport: async () => mockRejectionReport,
  practicePlan: async () => mockPracticePlan,
};
