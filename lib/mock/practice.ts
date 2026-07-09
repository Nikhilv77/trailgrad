import type { PracticePlan } from "@/types";

export const mockPracticePlan: PracticePlan = {
  days: [
    {
      day: 1,
      theme: "Project story clarity",
      tasks: [
        { id: "d1-t1", title: "Explain your RAG project in 90 seconds.", detail: "Cover user problem, data flow, retrieval, generation, and evaluation.", area: "Project Narrative", completed: false },
        { id: "d1-t2", title: "Rewrite your AI project resume bullet.", detail: "Add measurable latency, quality, or adoption outcomes.", area: "Resume Proof", completed: false },
      ],
    },
    {
      day: 2,
      theme: "Vector DB fundamentals",
      tasks: [
        { id: "d2-t1", title: "Practice 5 vector DB questions.", detail: "Similarity search, chunking, metadata filters, recall, and indexing tradeoffs.", area: "Technical Depth", completed: false },
        { id: "d2-t2", title: "Prepare answer: Why LangChain?", detail: "Compare speed of prototyping with production control and testing needs.", area: "Tool Choice", completed: false },
      ],
    },
    {
      day: 3,
      theme: "Evaluation and metrics",
      tasks: [
        { id: "d3-t1", title: "Define RAG evaluation metrics.", detail: "Use groundedness, retrieval recall, answer relevance, and refusal accuracy.", area: "Evaluation", completed: false },
      ],
    },
    {
      day: 4,
      theme: "Deployment proof",
      tasks: [
        { id: "d4-t1", title: "Connect AWS certification to a deployed project.", detail: "Describe hosting, observability, failure modes, and cost controls.", area: "Cloud Proof", completed: false },
      ],
    },
    {
      day: 5,
      theme: "Tradeoff answers",
      tasks: [
        { id: "d5-t1", title: "Practice retrieval tradeoffs.", detail: "Explain chunk size, reranking, caching, and hallucination mitigation.", area: "Architecture", completed: false },
      ],
    },
    {
      day: 6,
      theme: "Mock interview",
      tasks: [
        { id: "d6-t1", title: "Run one project deep-dive mock.", detail: "Record answers and review specificity gaps.", area: "Interview Practice", completed: false },
      ],
    },
    {
      day: 7,
      theme: "Final repair pass",
      tasks: [
        { id: "d7-t1", title: "Fix top three rejection risks.", detail: "Update resume bullets, project README, and answer bank.", area: "Readiness", completed: false },
      ],
    },
  ],
};
