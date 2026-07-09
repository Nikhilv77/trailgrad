import type { RejectionReport } from "@/types";

export const mockRejectionReport: RejectionReport = {
  overallRisk: 64,
  riskLevel: "high",
  breakdown: [
    { label: "Resume proof", score: 68, level: "high" },
    { label: "JD alignment", score: 42, level: "medium" },
    { label: "Project depth", score: 61, level: "medium" },
    { label: "Answer quality", score: 56, level: "medium" },
  ],
  topReasons: [
    {
      reason: "Your AI project lacks evaluation metrics.",
      whyItMatters: "AI interviewers often separate builders from tutorial followers by asking how quality was measured.",
      howToFix: "Create a small eval table with retrieval recall, groundedness, and answer relevance.",
      relatedTasks: ["Define 20 eval questions", "Add metrics to README", "Practice explaining failures"],
    },
    {
      reason: "AWS certification is not connected to a deployed project.",
      whyItMatters: "Credentials help only when they map to shipped, observable systems.",
      howToFix: "Attach deployment architecture, logs, alerts, and cost controls to your strongest AI project.",
      relatedTasks: ["Write cloud proof bullet", "Sketch deployment architecture"],
    },
    {
      reason: "Your resume claims RAG but does not explain architecture.",
      whyItMatters: "Vague RAG claims invite deep-dive questions that expose missing implementation details.",
      howToFix: "Prepare a 90-second pipeline explanation with ingestion, retrieval, prompting, and evaluation.",
      relatedTasks: ["Record RAG walkthrough", "Practice chunking questions"],
    },
  ],
};
