import { describe, expect, it } from "vitest";

import { createProject, getProject, getProjects } from "@/lib/services/project-service";

describe("project service", () => {
  it("returns the seeded mock projects", async () => {
    const projects = await getProjects();

    expect(projects.length).toBeGreaterThan(0);
    expect(projects[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        techStack: expect.any(Array),
      }),
    );
  });

  it("creates stable slugs from project names", async () => {
    const project = await createProject({
      name: "AI Resume Coach!!",
      summary: "Ranks resume risk before interviews.",
      techStack: ["Next.js", "OpenAI"],
    });

    expect(project).toMatchObject({
      id: "ai-resume-coach",
      proofScore: 45,
      interviewRisk: "medium",
      missingProof: ["metrics", "architecture notes"],
    });
  });

  it("falls back to a deterministic id when a name has no slug characters", async () => {
    const project = await createProject({
      name: "!!!",
      summary: "A project with punctuation only.",
      techStack: ["TypeScript"],
    });

    expect(project.id).toBe("new-project");
  });

  it("falls back to the first mock project for unknown ids", async () => {
    const [firstProject] = await getProjects();

    await expect(getProject("missing-project")).resolves.toEqual(firstProject);
  });
});
