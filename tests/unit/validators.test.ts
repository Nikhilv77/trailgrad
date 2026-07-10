import { describe, expect, it } from "vitest";

import { JDAnalyzeRequestSchema } from "@/lib/validators/jd";
import { ProjectSchema } from "@/lib/validators/project";
import { ResumeAnalyzeRequestSchema } from "@/lib/validators/resume";

describe("request validators", () => {
  it("requires meaningful resume text", () => {
    const result = ResumeAnalyzeRequestSchema.safeParse({
      resumeText: "too short",
      targetRole: "AI Engineer",
      experienceLevel: "Fresher",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      "Paste at least 20 characters of resume text.",
    );
  });

  it("requires meaningful job description text", () => {
    const result = JDAnalyzeRequestSchema.safeParse({
      jdText: "brief",
      targetRole: "AI Engineer",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      "Paste at least 20 characters of job description text.",
    );
  });

  it("accepts a valid project with an optional GitHub URL", () => {
    const result = ProjectSchema.safeParse({
      id: "rag-coach",
      name: "RAG Coach",
      summary: "Interview project prep assistant.",
      techStack: ["Next.js", "Postgres"],
      proofScore: 82,
      interviewRisk: "low",
      missingProof: [],
      githubUrl: "https://github.com/example/rag-coach",
    });

    expect(result.success).toBe(true);
  });
});
