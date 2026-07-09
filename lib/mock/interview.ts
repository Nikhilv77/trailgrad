import type { AnswerFeedback, InterviewQuestion } from "@/types";

export const mockQuestions: InterviewQuestion[] = [
  {
    id: "q1",
    question: "How does your RAG pipeline work end-to-end?",
    category: "Most Likely",
    difficulty: "medium",
    expectedPoints: ["document ingestion", "chunking strategy", "embedding search", "prompt grounding", "evaluation"],
    followUps: ["How did you choose chunk size?", "How did you measure retrieval quality?"],
  },
  {
    id: "q2",
    question: "What tradeoffs did you make when using LangChain?",
    category: "Tradeoffs",
    difficulty: "medium",
    expectedPoints: ["speed of development", "abstraction limits", "testing", "observability"],
    followUps: ["What would you replace if traffic increased?", "Where did you keep direct control?"],
  },
  {
    id: "q3",
    question: "How would the system behave if vector search returns poor context?",
    category: "Failure Handling",
    difficulty: "hard",
    expectedPoints: ["confidence threshold", "fallback response", "logging", "human-readable errors"],
    followUps: ["How would you detect this in production?", "What should the user see?"],
  },
  {
    id: "q4",
    question: "How would you secure uploaded resumes and job descriptions?",
    category: "Security",
    difficulty: "medium",
    expectedPoints: ["access control", "PII handling", "storage isolation", "retention policy"],
    followUps: ["What would you log?", "How would deletion work?"],
  },
];

export const mockAnswerFeedback: AnswerFeedback = {
  overallScore: 64,
  clarityScore: 7,
  technicalDepthScore: 5,
  specificityScore: 6,
  confidenceScore: 6,
  hireSignal: "mixed",
  whatWasGood: ["You named the core components clearly.", "The answer stayed relevant to the project."],
  missingPoints: ["Add concrete evaluation metrics.", "Explain one tradeoff you made.", "Mention failure handling and deployment constraints."],
  improvedAnswer:
    "My RAG pipeline ingests resume and JD text, chunks it by section, embeds each chunk, retrieves the most relevant context, and asks the model to produce risks with source-grounded evidence. I evaluated it with a small question set for retrieval recall and answer relevance, then added fallback messaging when confidence was low.",
  followUpQuestion: "What metric would tell you the retrieval step is hurting answer quality?",
  nextPracticeTopics: ["RAG evaluation", "Chunking tradeoffs", "Deployment monitoring"],
};
