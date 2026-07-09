import type { JDAnalysis, JDMatch } from "@/types";

export const mockJdAnalysis: JDAnalysis = {
  role: "AI Engineer",
  seniority: "Early-career to mid-level",
  requiredSkills: ["Python", "RAG", "LLM evaluation", "Vector databases", "Cloud deployment", "API design"],
  responsibilities: ["Build AI features", "Evaluate model quality", "Deploy reliable services", "Communicate architecture decisions"],
  hiddenSignals: ["They will probe project ownership.", "They expect production tradeoff awareness.", "They care about measurable quality."],
  interviewThemes: ["RAG architecture", "Evaluation", "Scaling", "Failure handling", "Cost control"],
};

export const mockJdMatch: JDMatch = {
  matchScore: 71,
  strongMatches: ["AI Engineer target role", "RAG project keywords", "LangChain experience", "AWS familiarity"],
  weakMatches: ["No clear eval framework", "Limited deployment details", "Vector DB proof is shallow"],
  missingProof: ["Before/after quality metrics", "Failure-handling decisions", "Cost and latency constraints"],
  rejectionRisks: [
    "Interviewer may see the project as a tutorial unless tradeoffs are explained.",
    "Resume claims RAG but the JD likely expects retrieval evaluation details.",
    "AWS certification will not help unless connected to shipped work.",
  ],
  recommendedNextSteps: [
    "Add one architecture diagram and README section for the RAG pipeline.",
    "Prepare an answer on chunking, retrieval recall, and hallucination mitigation.",
    "Add one deployed project proof point to the resume.",
  ],
};
