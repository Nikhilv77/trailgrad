import type { ResumeAnalysis } from "@/types";

export const mockResumeAnalysis: ResumeAnalysis = {
  score: 62,
  riskLevel: "medium",
  atsScore: 74,
  summary: "Your resume has relevant AI keywords, but the proof is too thin for a confident interview signal. The biggest repair is adding measurable project outcomes and system details.",
  criticalIssues: [
    "RAG appears as a keyword without architecture evidence.",
    "AWS certification is not backed by deployment examples.",
    "Project bullets understate metrics, scope, and ownership.",
  ],
  weakBullets: [
    {
      before: "Built a RAG chatbot using LangChain and vector database.",
      after: "Built a RAG chatbot with chunked ingestion, vector search, prompt grounding, and an eval set that improved answer relevance by 22%.",
    },
    {
      before: "Worked on AWS and deployed applications.",
      after: "Deployed the AI resume analyzer on AWS with monitored API routes, cost alerts, and rollback-ready environment configuration.",
    },
  ],
  skillsWithoutProof: ["LangChain", "Vector databases", "AWS", "Evaluation metrics"],
  missingMetrics: ["retrieval recall", "latency", "answer relevance", "user adoption", "cost per request"],
  suggestedBullets: [
    "Designed a RAG pipeline with source-grounded responses, metadata filtering, and evaluation checks for hallucination risk.",
    "Reduced interview-prep analysis time by turning resume, JD, and project data into a structured risk report.",
  ],
};
