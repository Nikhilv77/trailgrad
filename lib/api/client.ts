import type {
  AnswerFeedback,
  DashboardSnapshot,
  JDAnalysis,
  JDMatch,
  PracticePlan,
  ProgressSnapshot,
  Project,
  ProjectAnalysis,
  RejectionReport,
  ResumeAnalysis,
  UserProfile,
} from "@/types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error ?? "Trailgrad API request failed.");
  }
  return payload as T;
}

export const apiClient = {
  getDashboard: () => request<DashboardSnapshot>("/api/mock/dashboard"),
  analyzeResume: (body: { resumeText: string; targetRole: string; experienceLevel: string }) =>
    request<ResumeAnalysis>("/api/ai/analyze-resume", { method: "POST", body: JSON.stringify(body) }),
  analyzeJD: (body: { jdText: string; targetRole: string }) =>
    request<JDAnalysis>("/api/ai/analyze-jd", { method: "POST", body: JSON.stringify(body) }),
  compareJD: (body: { resumeId: string; jdText: string; targetRole: string }) =>
    request<JDMatch>("/api/ai/compare-jd", { method: "POST", body: JSON.stringify(body) }),
  getProjects: () => request<Project[]>("/api/projects"),
  getProject: (id: string) => request<Project>(`/api/projects/${id}`),
  analyzeProject: (body: { projectId: string }) =>
    request<ProjectAnalysis>("/api/ai/analyze-project", { method: "POST", body: JSON.stringify(body) }),
  generateQuestions: (body: { projectId: string; roundType: "project_deep_dive"; targetRole: string }) =>
    request<{ questions: import("@/types").InterviewQuestion[] }>("/api/ai/generate-questions", { method: "POST", body: JSON.stringify(body) }),
  gradeAnswer: (body: { question: string; answer: string; context?: string }) =>
    request<AnswerFeedback>("/api/ai/grade-answer", { method: "POST", body: JSON.stringify(body) }),
  getRejectionReport: () => request<RejectionReport>("/api/ai/rejection-report"),
  getPracticePlan: () => request<PracticePlan>("/api/ai/practice-plan"),
  getProgress: () => request<ProgressSnapshot>("/api/ai/practice-plan?view=progress"),
  getProfile: () => request<UserProfile>("/api/profile"),
};
