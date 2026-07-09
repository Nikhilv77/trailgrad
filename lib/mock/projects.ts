import type { Project, ProjectAnalysis } from "@/types";

export const mockProjects: Project[] = [
  {
    id: "demo-project",
    name: "RAG Interview Coach",
    summary: "A resume and JD analyzer that produces rejection risks and interview questions.",
    techStack: ["Next.js", "TypeScript", "LangChain", "Vector DB", "AWS"],
    proofScore: 58,
    interviewRisk: "high",
    missingProof: ["evaluation metrics", "failure handling", "cost controls"],
    githubUrl: "https://github.com/demo/rag-interview-coach",
  },
  {
    id: "portfolio-ai",
    name: "AI Portfolio Analyzer",
    summary: "Analyzes project descriptions and recommends stronger technical proof.",
    techStack: ["Python", "FastAPI", "OpenAI", "Postgres"],
    proofScore: 67,
    interviewRisk: "medium",
    missingProof: ["live demo traffic", "security review"],
  },
  {
    id: "aws-deploy",
    name: "AWS Deployment Lab",
    summary: "A deployment practice project for APIs, logs, alerts, and environment management.",
    techStack: ["AWS", "Docker", "Node.js", "CloudWatch"],
    proofScore: 72,
    interviewRisk: "medium",
    missingProof: ["business outcome", "user-facing value"],
  },
];

export const mockProjectAnalysis: ProjectAnalysis = {
  projectId: "demo-project",
  depthScore: 61,
  riskLevel: "medium",
  strengths: ["Clear target user", "Relevant RAG stack", "Good interview-prep framing"],
  gaps: ["No measured eval set", "No failure mode writeup", "No cost estimate"],
  suggestedProof: [
    "Add a table of 20 test questions with groundedness and answer relevance scores.",
    "Document fallback behavior when retrieval confidence is low.",
    "Add a short deployment and cost section to the README.",
  ],
};
