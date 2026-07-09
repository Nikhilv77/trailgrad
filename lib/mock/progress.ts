import type { ProgressSnapshot } from "@/types";

export const mockProgress: ProgressSnapshot = {
  readinessTrend: [41, 45, 49, 52, 55, 58, 63],
  completedTasks: 9,
  totalTasks: 21,
  streakDays: 3,
  weakAreas: [
    { label: "RAG evaluation metrics", severity: "high", evidence: "Project has no answer quality or retrieval recall numbers.", fix: "Add a small eval set and report precision, recall, and groundedness." },
    { label: "Cloud deployment proof", severity: "medium", evidence: "AWS certificate appears isolated from portfolio work.", fix: "Tie AWS services to the deployed AI project architecture." },
    { label: "Architecture narrative", severity: "medium", evidence: "Resume says RAG but does not explain ingestion, retrieval, reranking, or safety.", fix: "Prepare a crisp end-to-end system walkthrough." },
  ],
};
