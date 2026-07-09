import { aiOrchestrator } from "@/lib/ai/ai-orchestrator";
import { mockDb } from "@/lib/db/mock-db";
import type { AnalyzeProjectRequestSchema } from "@/lib/validators/project";
import type { Project } from "@/types";
import type { z } from "zod";

// TODO: Replace mock-db with Supabase later.
export async function getProjects() {
  return mockDb.projects;
}

export async function getProject(id: string) {
  return mockDb.projects.find((project) => project.id === id) ?? mockDb.projects[0];
}

export async function createProject(input: Pick<Project, "name" | "summary" | "techStack">) {
  return {
    id: input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "new-project",
    name: input.name,
    summary: input.summary,
    techStack: input.techStack,
    proofScore: 45,
    interviewRisk: "medium" as const,
    missingProof: ["metrics", "architecture notes"],
  };
}

export async function analyzeProject(_input: z.infer<typeof AnalyzeProjectRequestSchema>) {
  return aiOrchestrator.analyzeProject();
}
