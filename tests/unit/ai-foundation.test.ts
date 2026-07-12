import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { syntheticCandidateFixture } from "@/tests/fixtures/synthetic-ai-fixture";
import { getAIConfiguration } from "@/lib/ai/configuration";
import { estimateAICostUsd, aiModelPrices } from "@/lib/ai/cost";
import { assertAIDataPolicyAllowsContent } from "@/lib/ai/data-policy";
import { redactModelBoundText } from "@/lib/ai/redaction";
import { resumeExtractionSchema } from "@/lib/ai/schemas/resume-extraction";
import { candidateRiskOutputSchema } from "@/lib/ai/schemas/candidate-risks";
import { proofMapOutputSchema } from "@/lib/ai/schemas/proof-map";
import { sprintPlanSchema } from "@/lib/ai/schemas/sprint-plan";
import { interviewQuestionSetSchema } from "@/lib/ai/schemas/interview-questions";
import type { GeminiLikeClient } from "@/lib/ai/providers/gemini-provider";

const aiRunRepo = vi.hoisted(() => ({
  createAiRunRecord: vi.fn(),
}));
const budget = vi.hoisted(() => ({
  assertWithinMonthlyAIBudget: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    aiRun: {
      aggregate: vi.fn(),
    },
  },
}));
vi.mock("@/lib/db/ai-run-repository", () => aiRunRepo);
vi.mock("@/lib/ai/cost", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/ai/cost")>()),
  assertWithinMonthlyAIBudget: budget.assertWithinMonthlyAIBudget,
}));

const sourceReference = {
  sourceId: "synthetic-resume-1",
  sourceType: "synthetic_fixture" as const,
  locator: "line 4",
  quote: "Built the Lantern Ledger project",
};

const resumeExtraction = {
  summary: "Mira Testwell has synthetic full-stack project evidence.",
  experiences: [
    {
      organization: "Northstar Toy Systems",
      title: "Synthetic intern",
      highlights: ["Built classroom robotics dashboards."],
      sourceReference,
    },
  ],
  education: [],
  projects: [
    {
      name: "Lantern Ledger",
      description: "A fictional analytics tool for classroom robotics clubs.",
      technologies: ["TypeScript", "PostgreSQL", "React"],
      sourceReference,
    },
  ],
  skills: ["TypeScript", "PostgreSQL", "React", "testing"],
  certifications: [],
  achievements: [
    {
      achievement: "Improved synthetic dashboard load time by 42%.",
      sourceReference,
    },
  ],
  claims: [
    {
      claim: "Built Lantern Ledger.",
      category: "project" as const,
      sourceReference,
      confidence: 0.92,
    },
  ],
  uncertaintyNotes: [],
};

function configuration(overrides: Partial<ReturnType<typeof getAIConfiguration>> = {}) {
  return {
    ...getAIConfiguration({
      AI_PROVIDER: "gemini",
      AI_DATA_POLICY: "synthetic_only",
      GEMINI_API_KEY: "test-key",
      GEMINI_EXTRACTION_MODEL: "gemini-primary",
      GEMINI_ANALYSIS_MODEL: "gemini-analysis",
      GEMINI_FALLBACK_MODEL: "gemini-fallback",
      AI_DEFAULT_TIMEOUT_MS: "50",
      AI_MAX_RETRIES: "1",
      AI_MONTHLY_BUDGET_USD: "0",
    }),
    ...overrides,
  };
}

function clientWithResponses(responses: Array<unknown>) {
  const generateContent = vi.fn(async (params: {
    model: string;
    contents: string;
    config: Record<string, unknown>;
  }) => {
    void params;
    const response = responses.shift();

    if (response instanceof Error) {
      throw response;
    }

    if (response && typeof response === "object" && "reject" in response) {
      throw response.reject;
    }

    return response as Awaited<ReturnType<GeminiLikeClient["models"]["generateContent"]>>;
  });

  return {
    client: {
      models: {
        generateContent,
      },
    } satisfies GeminiLikeClient,
    generateContent,
  };
}

function geminiText(data: unknown, tokens = { input: 20, output: 10, cached: 0 }) {
  return {
    text: typeof data === "string" ? data : JSON.stringify(data),
    modelVersion: "gemini-primary-version",
    candidates: [{ finishReason: "STOP" }],
    usageMetadata: {
      promptTokenCount: tokens.input,
      candidatesTokenCount: tokens.output,
      cachedContentTokenCount: tokens.cached,
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  budget.assertWithinMonthlyAIBudget.mockResolvedValue(undefined);
  aiRunRepo.createAiRunRecord.mockResolvedValue({});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("AI provider factory", () => {
  it("returns the Gemini provider for AI_PROVIDER=gemini", async () => {
    vi.stubEnv("AI_PROVIDER", "gemini");
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    const { getAIProvider, resetAIProviderForTests } = await import(
      "@/lib/ai/provider-factory"
    );

    resetAIProviderForTests();
    expect(getAIProvider().constructor.name).toBe("GeminiProvider");
  });

  it("fails clearly for unsupported providers", async () => {
    vi.stubEnv("AI_PROVIDER", "openai");
    const { getAIProvider, resetAIProviderForTests } = await import(
      "@/lib/ai/provider-factory"
    );

    resetAIProviderForTests();
    expect(() => getAIProvider()).toThrow(/Unsupported AI_PROVIDER/);
  });
});

describe("AI data policy", () => {
  it("allows explicitly marked synthetic fixtures", () => {
    expect(() =>
      assertAIDataPolicyAllowsContent({
        configuration: configuration(),
        content: syntheticCandidateFixture,
      }),
    ).not.toThrow();
  });

  it("blocks real-looking candidate content when synthetic_only is active", () => {
    expect(() =>
      assertAIDataPolicyAllowsContent({
        configuration: configuration(),
        content:
          "Resume for real candidate Alex. Email alex@example.com. Job description attached.",
      }),
    ).toThrow(/synthetic_only blocks/);
  });
});

describe("Gemini structured provider", () => {
  it("returns valid Gemini structured output and logs metadata only", async () => {
    const { GeminiProvider } = await import("@/lib/ai/providers/gemini-provider");
    const { client, generateContent } = clientWithResponses([
      geminiText(resumeExtraction),
    ]);
    const provider = new GeminiProvider({
      client,
      configuration: configuration(),
    });

    const result = await provider.generateStructured({
      operation: "resume_extraction",
      systemInstruction: "Extract resume evidence.",
      content: syntheticCandidateFixture,
      schema: resumeExtractionSchema,
      schemaName: "ResumeExtraction",
      modelClass: "extraction",
      promptVersion: "test-v1",
      profileId: "profile_1",
      analysisJobId: "job_1",
    });

    expect(result.data.claims[0]?.claim).toBe("Built Lantern Ledger.");
    expect(result.provider).toBe("gemini");
    expect(result.inputTokens).toBe(20);
    expect(generateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gemini-primary",
        config: expect.objectContaining({
          responseMimeType: "application/json",
          systemInstruction: "Extract resume evidence.",
        }),
      }),
    );
    expect(aiRunRepo.createAiRunRecord).toHaveBeenCalledWith(
      expect.not.objectContaining({
        content: expect.anything(),
        prompt: expect.anything(),
        response: expect.anything(),
      }),
    );
    expect(aiRunRepo.createAiRunRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "COMPLETED",
        operation: "resume_extraction",
        profileId: "profile_1",
        analysisJobId: "job_1",
      }),
    );
  });

  it("maps invalid JSON to INVALID_STRUCTURED_OUTPUT", async () => {
    const { GeminiProvider } = await import("@/lib/ai/providers/gemini-provider");
    const { client } = clientWithResponses([geminiText("{not-json"), geminiText("{not-json")]);
    const provider = new GeminiProvider({
      client,
      configuration: configuration({ maxRetries: 0 }),
    });

    await expect(
      provider.generateStructured({
        operation: "resume_extraction",
        systemInstruction: "Extract.",
        content: syntheticCandidateFixture,
        schema: resumeExtractionSchema,
        schemaName: "ResumeExtraction",
        modelClass: "extraction",
        promptVersion: "test-v1",
      }),
    ).rejects.toMatchObject({ code: "INVALID_STRUCTURED_OUTPUT" });
  });

  it("maps Zod validation failure to INVALID_STRUCTURED_OUTPUT", async () => {
    const { GeminiProvider } = await import("@/lib/ai/providers/gemini-provider");
    const { client } = clientWithResponses([
      geminiText({ summary: "missing required arrays" }),
      geminiText({ summary: "missing required arrays" }),
    ]);
    const provider = new GeminiProvider({
      client,
      configuration: configuration({ maxRetries: 0 }),
    });

    await expect(
      provider.generateStructured({
        operation: "resume_extraction",
        systemInstruction: "Extract.",
        content: syntheticCandidateFixture,
        schema: resumeExtractionSchema,
        schemaName: "ResumeExtraction",
        modelClass: "extraction",
        promptVersion: "test-v1",
      }),
    ).rejects.toMatchObject({ code: "INVALID_STRUCTURED_OUTPUT" });
  });

  it("maps timeout errors safely", async () => {
    const { GeminiProvider } = await import("@/lib/ai/providers/gemini-provider");
    const timeoutError = new Error("aborted");
    timeoutError.name = "AbortError";
    const { client, generateContent } = clientWithResponses([
      { reject: timeoutError },
      { reject: timeoutError },
    ]);
    const provider = new GeminiProvider({
      client,
      configuration: configuration({ maxRetries: 0 }),
    });

    await expect(
      provider.generateStructured({
        operation: "resume_extraction",
        systemInstruction: "Extract.",
        content: syntheticCandidateFixture,
        schema: resumeExtractionSchema,
        schemaName: "ResumeExtraction",
        modelClass: "extraction",
        promptVersion: "test-v1",
      }),
    ).rejects.toMatchObject({ code: "TIMEOUT" });
    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  it("maps rate-limit errors safely", async () => {
    const { GeminiProvider } = await import("@/lib/ai/providers/gemini-provider");
    const { client, generateContent } = clientWithResponses([
      { reject: { status: 429, message: "rate limit" } },
      { reject: { status: 429, message: "rate limit" } },
    ]);
    const provider = new GeminiProvider({
      client,
      configuration: configuration({ maxRetries: 0 }),
    });

    await expect(
      provider.generateStructured({
        operation: "resume_extraction",
        systemInstruction: "Extract.",
        content: syntheticCandidateFixture,
        schema: resumeExtractionSchema,
        schemaName: "ResumeExtraction",
        modelClass: "extraction",
        promptVersion: "test-v1",
      }),
    ).rejects.toMatchObject({ code: "RATE_LIMITED" });
    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  it("escalates to the fallback model for low-confidence output", async () => {
    const { GeminiProvider } = await import("@/lib/ai/providers/gemini-provider");
    const lowConfidence = {
      ...resumeExtraction,
      claims: [{ ...resumeExtraction.claims[0], confidence: 0.2 }],
    };
    const { client, generateContent } = clientWithResponses([
      geminiText(lowConfidence),
      geminiText(resumeExtraction),
    ]);
    const provider = new GeminiProvider({
      client,
      configuration: configuration({ maxRetries: 1 }),
    });

    const result = await provider.generateStructured({
      operation: "resume_extraction",
      systemInstruction: "Extract.",
      content: syntheticCandidateFixture,
      schema: resumeExtractionSchema,
      schemaName: "ResumeExtraction",
      modelClass: "extraction",
      promptVersion: "test-v1",
    });

    expect(result.usedFallback).toBe(true);
    expect(generateContent.mock.calls.map((call) => call[0]?.model)).toEqual([
      "gemini-primary",
      "gemini-fallback",
    ]);
  });

  it("enforces the maximum attempt limit", async () => {
    const { GeminiProvider } = await import("@/lib/ai/providers/gemini-provider");
    const { client, generateContent } = clientWithResponses([
      geminiText("{bad-json"),
      geminiText("{bad-json"),
      geminiText(resumeExtraction),
    ]);
    const provider = new GeminiProvider({
      client,
      configuration: configuration({ maxRetries: 0 }),
    });

    await expect(
      provider.generateStructured({
        operation: "resume_extraction",
        systemInstruction: "Extract.",
        content: syntheticCandidateFixture,
        schema: resumeExtractionSchema,
        schemaName: "ResumeExtraction",
        modelClass: "extraction",
        promptVersion: "test-v1",
      }),
    ).rejects.toMatchObject({ code: "INVALID_STRUCTURED_OUTPUT" });
    expect(generateContent).toHaveBeenCalledTimes(2);
  });

  it("logs failed AI runs without private source content", async () => {
    const { GeminiProvider } = await import("@/lib/ai/providers/gemini-provider");
    const { client } = clientWithResponses([geminiText("{bad-json"), geminiText("{bad-json")]);
    const provider = new GeminiProvider({
      client,
      configuration: configuration({ maxRetries: 0 }),
    });

    await expect(
      provider.generateStructured({
        operation: "resume_extraction",
        systemInstruction: "Extract.",
        content: `${syntheticCandidateFixture}\nSecret line that must not be logged.`,
        schema: resumeExtractionSchema,
        schemaName: "ResumeExtraction",
        modelClass: "extraction",
        promptVersion: "test-v1",
        profileId: "profile_1",
      }),
    ).rejects.toMatchObject({ code: "INVALID_STRUCTURED_OUTPUT" });

    expect(aiRunRepo.createAiRunRecord).toHaveBeenLastCalledWith(
      expect.objectContaining({
        status: "FAILED",
        safeErrorCode: "INVALID_STRUCTURED_OUTPUT",
      }),
    );
    expect(JSON.stringify(aiRunRepo.createAiRunRecord.mock.calls)).not.toContain(
      "Secret line",
    );
  });
});

describe("redaction and costs", () => {
  it("redacts model-bound personal data and sensitive URL query values", () => {
    expect(
      redactModelBoundText(
        "Email alex@example.com, phone 415-555-1212, address 123 Main Street, url https://example.com/callback?token=abc&ok=1",
      ),
    ).toContain("[REDACTED_EMAIL]");
    expect(
      redactModelBoundText(
        "Email alex@example.com, phone 415-555-1212, address 123 Main Street, url https://example.com/callback?token=abc&ok=1",
      ),
    ).toContain("token=%5BREDACTED%5D");
  });

  it("calculates token cost from central model pricing", () => {
    aiModelPrices["test-priced-model"] = {
      inputPerMillionTokensUsd: 1,
      outputPerMillionTokensUsd: 2,
      cachedInputPerMillionTokensUsd: 0.5,
    };

    expect(
      estimateAICostUsd({
        model: "test-priced-model",
        inputTokens: 1000,
        outputTokens: 500,
        cachedTokens: 100,
      }),
    ).toBe(0.00195);
  });
});

describe("synthetic fixture schema chain", () => {
  it("validates resume extraction to claims to risks to proof map to sprint and questions", () => {
    const parsedResume = resumeExtractionSchema.parse(resumeExtraction);
    expect(parsedResume.claims).toHaveLength(1);

    const risks = candidateRiskOutputSchema.parse({
      risks: [
        {
          title: "Needs API debugging evidence",
          explanation: "The fixture has project work but limited debugging proof.",
          severity: "MEDIUM",
          sourceReference,
          affectedSkill: "API design",
          affectedProject: "Lantern Ledger",
          likelyInterviewQuestion: "How did you debug a failing API path?",
          confidence: 0.8,
        },
      ],
      uncertaintyNotes: ["Synthetic fixture has compact evidence only."],
    });
    expect(risks.risks[0]?.affectedProject).toBe("Lantern Ledger");

    const proofMap = proofMapOutputSchema.parse({
      evidence: [
        {
          claim: parsedResume.claims[0]?.claim,
          status: "CLAIMED",
          explanation: "Resume-only claim is not interview proven.",
          sourceReferences: [sourceReference],
          confidence: 0.9,
        },
      ],
      uncertaintyNotes: [],
    });
    expect(proofMap.evidence[0]?.status).toBe("CLAIMED");

    const sprint = sprintPlanSchema.parse({
      title: "API debugging evidence sprint",
      outcome: "Produce a compact debugging writeup.",
      duration: "3 days",
      intensity: "STANDARD",
      tasks: [
        {
          title: "Write debugging evidence",
          description: "Document one synthetic API failure and fix.",
          estimatedMinutes: 45,
          affectedEvidenceOrSkill: "API design",
        },
      ],
    });
    expect(sprint.tasks[0]?.estimatedMinutes).toBe(45);

    const questionSet = interviewQuestionSetSchema.parse({
      queues: {
        MUST_ANSWER: [
          {
            question: "Walk me through Lantern Ledger.",
            difficulty: "MEDIUM",
            questionType: "PROJECT_DEEP_DIVE",
            competency: "Project explanation",
            whySelected: "It is the main project claim.",
            expectedEvidence: ["Architecture", "tradeoffs"],
            sourceReference,
            likelyFollowUps: ["What would you change?"],
          },
        ],
        LIKELY: [],
        STRETCH: [],
      },
    });
    expect(questionSet.queues.MUST_ANSWER).toHaveLength(1);
  });
});
