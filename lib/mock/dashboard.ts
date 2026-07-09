import type { DashboardSnapshot } from "@/types";
import { mockProgress } from "./progress";

export const mockDashboard: DashboardSnapshot = {
  readiness: 58,
  rejectionRisk: 64,
  jdMatch: 71,
  projectDepth: "Medium",
  practiceStreak: 3,
  topRisks: [
    "Your AI project lacks evaluation metrics.",
    "AWS certification is not connected to a deployed project.",
    "Your resume claims RAG but does not explain architecture.",
  ],
  todayPlan: [
    { id: "today-1", title: "Explain your RAG project in 90 seconds.", detail: "Record once, then cut vague tool-name claims.", area: "Project Narrative", completed: false },
    { id: "today-2", title: "Practice 5 vector DB questions.", detail: "Focus on recall, chunking, metadata, and reranking.", area: "Technical Depth", completed: false },
    { id: "today-3", title: "Rewrite your AI project resume bullet.", detail: "Add metrics, deployment context, and user impact.", area: "Resume Proof", completed: false },
  ],
  progress: mockProgress,
};
