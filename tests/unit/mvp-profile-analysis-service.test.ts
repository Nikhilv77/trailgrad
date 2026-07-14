import { beforeEach, describe, expect, it, vi } from "vitest";

import type { OnboardingSubmission } from "@/lib/onboarding/types";
import type { MVPAnalysis } from "@/lib/ai/schemas/mvp-analysis";

const analysisJobRepo = vi.hoisted(() => ({
  findAnalysisJobByIdRecord: vi.fn(),
}));
const analysisJobService = vi.hoisted(() => ({
  claimAnalysisJobForRun: vi.fn(),
  completeAnalysisJob: vi.fn(),
  failAnalysisJob: vi.fn(),
  persistAnalysisJobProgress: vi.fn(),
}));
const profileAnalysisRepo = vi.hoisted(() => ({
  completeProfileAnalysisRecord: vi.fn(),
  failProfileAnalysisRecord: vi.fn(),
  loadMVPAnalysisInputContextRecord: vi.fn(),
  reserveProfileAnalysisRecord: vi.fn(),
}));
const profileService = vi.hoisted(() => ({
  markOnboardingFailed: vi.fn(),
}));
const providerFactory = vi.hoisted(() => ({
  getAIProvider: vi.fn(),
}));

vi.mock("@/lib/db/analysis-job-repository", () => analysisJobRepo);
vi.mock("@/lib/services/analysis-job-service", () => analysisJobService);
vi.mock("@/lib/db/profile-analysis-repository", () => profileAnalysisRepo);
vi.mock("@/lib/services/profile-service", () => profileService);
vi.mock("@/lib/ai/provider-factory", () => providerFactory);

const onboarding: OnboardingSubmission = {
  targetRole: "ai-engineer",
  experienceLevel: "junior",
  resumeName: "resume.pdf",
};

const job = {
  id: "job_1",
  profileId: "profile_1",
  sourceDocumentId: "source_1",
  targetContextId: null,
  type: "INITIAL_PROFILE" as const,
  status: "QUEUED" as const,
  currentStage: "resume_analysis" as const,
  progressPercent: 0,
  idempotencyKey: "INITIAL_PROFILE:profile_1:source_1",
  attemptCount: 0,
  safeErrorCode: null,
  safeErrorMessage: null,
  startedAt: null,
  completedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const sourceReference = {
  sourceType: "resume" as const,
  locator: "resume line 2",
  excerpt: "TRAILGRAD_SYNTHETIC_FIXTURE Built Lantern Ledger.",
};

const validAnalysis: MVPAnalysis = {
  profileSummary: "Synthetic candidate has junior full-stack project evidence.",
  targetAlignment: {
    selectedRoleLabel: "AI Engineer",
    detectedResumeDirection: "Junior full-stack project candidate",
    detectedJobDirection: null,
    mismatchLevel: "LOW",
    shouldAskUserToConfirmTarget: false,
    recommendedTarget: "selected_role",
    explanation:
      "The selected role and resume evidence are close enough for an initial AI engineering readiness review.",
  },
  strongestSignals: [
    "Clear project ownership claim",
    "Relevant TypeScript skill",
    "Testing experience is mentioned",
  ],
  rejectionRisks: [
    {
      title: "Project depth may be challenged",
      reason: "The resume gives limited architecture detail.",
      severity: "MEDIUM",
      sourceReference,
      likelyQuestion: "How was Lantern Ledger designed?",
      recommendedFix: "Add a concise architecture note.",
    },
    {
      title: "Impact evidence is thin",
      reason: "Only one synthetic metric is present.",
      severity: "MEDIUM",
      sourceReference,
      likelyQuestion: "How did you measure the 42% improvement?",
      recommendedFix: "Clarify measurement context without inventing data.",
    },
    {
      title: "Interview examples need structure",
      reason: "The resume does not show conflict or debugging stories.",
      severity: "LOW",
      sourceReference,
      likelyQuestion: "Tell me about a difficult bug.",
      recommendedFix: "Prepare one debugging STAR story.",
    },
  ],
  resumeSuggestions: [
    "Add one architecture bullet.",
    "Clarify testing scope.",
  ],
  importantQuestions: [
    {
      question: "Walk me through Lantern Ledger.",
      difficulty: "MEDIUM",
      whyAsked: "It is the strongest project signal.",
      relatedSource: sourceReference,
      answerFocus: "Ownership, architecture, and tradeoffs.",
    },
    {
      question: "How did you improve performance?",
      difficulty: "MEDIUM",
      whyAsked: "The resume mentions a metric.",
      relatedSource: sourceReference,
      answerFocus: "Measurement method and constraints.",
    },
    {
      question: "What tests did you write?",
      difficulty: "EASY",
      whyAsked: "Testing is listed as a skill.",
      relatedSource: sourceReference,
      answerFocus: "Specific tests and confidence gained.",
    },
    {
      question: "What would you change now?",
      difficulty: "MEDIUM",
      whyAsked: "Reflective project judgment matters.",
      relatedSource: sourceReference,
      answerFocus: "Prioritized improvements.",
    },
    {
      question: "How would you debug a failing API?",
      difficulty: "HARD",
      whyAsked: "Backend readiness is implied.",
      relatedSource: sourceReference,
      answerFocus: "Step-by-step diagnosis.",
    },
  ],
  todayPriority: {
    title: "Write the Lantern Ledger architecture note",
    reason: "It addresses the highest project-depth risk.",
    estimatedMinutes: 45,
    steps: ["Outline architecture", "Add tradeoffs", "Add one testing note"],
    expectedImpact: "Stronger project explanation for interviews.",
  },
  sevenDayPlan: Array.from({ length: 7 }, (_, index) => ({
    day: index + 1,
    title: `Day ${index + 1}`,
    task: "Improve one evidence point.",
    estimatedMinutes: 30,
  })),
  readiness: {
    applicationReadiness: "MEDIUM",
    evidenceStrength: "MEDIUM",
    projectDepth: "MEDIUM",
    interviewPerformanceStatus: "NOT_ASSESSED",
  },
};

function context(overrides: Record<string, unknown> = {}) {
  return {
    profileId: "profile_1",
    onboarding,
    resumeVersion: {
      id: "resume_version_1",
      sourceDocumentId: "source_1",
      extractedText:
        "TRAILGRAD_SYNTHETIC_FIXTURE\nBuilt Lantern Ledger with TypeScript.",
    },
    careerContext: {
      primaryTargetRole: "ai-engineer",
      experienceLevel: "junior",
      interviewOrApplicationDate: null,
      noDateYet: true,
      dailyPreparationMinutes: 30,
      flexiblePreparationTime: false,
      preparationIntensity: "standard",
    },
    targetContext: null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("AI_PROVIDER", "gemini");
  vi.stubEnv("AI_DATA_POLICY", "synthetic_only");
  vi.stubEnv("GEMINI_API_KEY", "test-key");

  analysisJobRepo.findAnalysisJobByIdRecord.mockResolvedValue(job);
  analysisJobService.claimAnalysisJobForRun.mockResolvedValue({
    ...job,
    status: "RUNNING",
  });
  analysisJobService.completeAnalysisJob.mockResolvedValue({
    ...job,
    status: "COMPLETED",
  });
  analysisJobService.failAnalysisJob.mockResolvedValue(undefined);
  analysisJobService.persistAnalysisJobProgress.mockResolvedValue(undefined);
  profileAnalysisRepo.loadMVPAnalysisInputContextRecord.mockResolvedValue(context());
  profileAnalysisRepo.reserveProfileAnalysisRecord.mockResolvedValue({
    id: "profile_analysis_1",
    profileId: "profile_1",
    resumeVersionId: "resume_version_1",
    targetContextId: null,
    status: "PENDING",
    result: null,
    promptVersion: "mvp-profile-analysis-v4-trail-focus",
    provider: "pending",
    model: "pending",
    safeErrorCode: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  });
  profileAnalysisRepo.completeProfileAnalysisRecord.mockImplementation(async (input) => ({
    id: input.id,
    profileId: "profile_1",
    resumeVersionId: "resume_version_1",
    targetContextId: null,
    status: "COMPLETED",
    result: input.result,
    promptVersion: input.promptVersion,
    provider: input.provider,
    model: input.model,
    safeErrorCode: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:01.000Z",
  }));
  profileAnalysisRepo.failProfileAnalysisRecord.mockResolvedValue(undefined);
  profileService.markOnboardingFailed.mockResolvedValue(undefined);
  providerFactory.getAIProvider.mockReturnValue({
    generateStructured: vi.fn(async () => ({
      data: validAnalysis,
      provider: "gemini",
      model: "gemini-test",
      inputTokens: 100,
      outputTokens: 200,
      cachedTokens: 0,
      estimatedCostUsd: 0,
      durationMs: 10,
      finishReason: "STOP",
      usedFallback: false,
    })),
  });
});

describe("MVP profile analysis workflow", () => {
  it("runs resume-only analysis and stores a completed structured result", async () => {
    const { runMVPProfileAnalysisJob } = await import(
      "@/lib/services/mvp-profile-analysis-service"
    );

    await expect(runMVPProfileAnalysisJob("job_1")).resolves.toMatchObject({
      executed: true,
      reason: "completed",
      profileAnalysis: {
        status: "COMPLETED",
      },
    });
    expect(profileAnalysisRepo.completeProfileAnalysisRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        result: validAnalysis,
        provider: "gemini",
        model: "gemini-test",
      }),
    );
    expect(profileService.markOnboardingFailed).not.toHaveBeenCalled();
  });

  it("includes optional JD context when present", async () => {
    const provider = {
      generateStructured: vi.fn(async () => ({
        data: validAnalysis,
        provider: "gemini",
        model: "gemini-test",
        inputTokens: 100,
        outputTokens: 200,
        cachedTokens: 0,
        estimatedCostUsd: 0,
        durationMs: 10,
        finishReason: "STOP",
        usedFallback: false,
      })),
    };
    providerFactory.getAIProvider.mockReturnValue(provider);
    profileAnalysisRepo.loadMVPAnalysisInputContextRecord.mockResolvedValue(
      context({
        targetContext: {
          id: "target_1",
          role: "ai-engineer",
          company: "Fictional Robotics Co",
          jobTitle: "Junior AI Engineer",
          jobDescription: "TRAILGRAD_SYNTHETIC_FIXTURE Build eval tools.",
        },
      }),
    );
    const { runMVPProfileAnalysisJob } = await import(
      "@/lib/services/mvp-profile-analysis-service"
    );

    await runMVPProfileAnalysisJob("job_1");
    expect(provider.generateStructured).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining("Build eval tools"),
      }),
    );
  });

  it("preserves NOT_ASSESSED interview performance in valid output", async () => {
    const { runMVPProfileAnalysisJob } = await import(
      "@/lib/services/mvp-profile-analysis-service"
    );

    await runMVPProfileAnalysisJob("job_1");
    expect(profileAnalysisRepo.completeProfileAnalysisRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        result: expect.objectContaining({
          readiness: expect.objectContaining({
            interviewPerformanceStatus: "NOT_ASSESSED",
          }),
        }),
      }),
    );
  });

  it("accepts the valid MVP structured result shape", async () => {
    const { mvpAnalysisSchema } = await import("@/lib/ai/schemas/mvp-analysis");

    expect(() => mvpAnalysisSchema.parse(validAnalysis)).not.toThrow();
    expect(validAnalysis.strongestSignals).toHaveLength(3);
    expect(validAnalysis.rejectionRisks).toHaveLength(3);
    expect(validAnalysis.importantQuestions).toHaveLength(5);
    expect(validAnalysis.sevenDayPlan).toHaveLength(7);
    expect(validAnalysis.targetAlignment).toMatchObject({
      mismatchLevel: "LOW",
      recommendedTarget: "selected_role",
    });
  });

  it("fails safely for invalid structured result", async () => {
    providerFactory.getAIProvider.mockReturnValue({
      generateStructured: vi.fn(async () => ({
        data: { ...validAnalysis, importantQuestions: [] },
        provider: "gemini",
        model: "gemini-test",
        inputTokens: 100,
        outputTokens: 200,
        cachedTokens: 0,
        estimatedCostUsd: 0,
        durationMs: 10,
        finishReason: "STOP",
        usedFallback: false,
      })),
    });
    const { runMVPProfileAnalysisJob } = await import(
      "@/lib/services/mvp-profile-analysis-service"
    );

    await expect(runMVPProfileAnalysisJob("job_1")).rejects.toMatchObject({
      code: "PROFILE_ANALYSIS_FAILED",
    });
    expect(profileAnalysisRepo.failProfileAnalysisRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "profile_analysis_1",
        safeErrorCode: "PROFILE_ANALYSIS_FAILED",
      }),
    );
    expect(profileService.markOnboardingFailed).toHaveBeenCalled();
  });

  it("does not duplicate a completed analysis on duplicate execution", async () => {
    profileAnalysisRepo.reserveProfileAnalysisRecord.mockResolvedValue({
      id: "profile_analysis_1",
      profileId: "profile_1",
      resumeVersionId: "resume_version_1",
      targetContextId: null,
      status: "COMPLETED",
      result: validAnalysis,
      promptVersion: "mvp-profile-analysis-v4-trail-focus",
      provider: "gemini",
      model: "gemini-test",
      safeErrorCode: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:01.000Z",
    });
    const { runMVPProfileAnalysisJob } = await import(
      "@/lib/services/mvp-profile-analysis-service"
    );

    await expect(runMVPProfileAnalysisJob("job_1")).resolves.toMatchObject({
      executed: false,
      reason: "duplicate_completed",
    });
    expect(providerFactory.getAIProvider).not.toHaveBeenCalled();
  });

  it("stores safe failure state on provider failure", async () => {
    providerFactory.getAIProvider.mockReturnValue({
      generateStructured: vi.fn(async () => {
        throw Object.assign(new Error("provider unavailable detail"), {
          code: "PROVIDER_UNAVAILABLE",
        });
      }),
    });
    const { runMVPProfileAnalysisJob } = await import(
      "@/lib/services/mvp-profile-analysis-service"
    );

    await expect(runMVPProfileAnalysisJob("job_1")).rejects.toMatchObject({
      code: "PROFILE_ANALYSIS_FAILED",
    });
    expect(profileAnalysisRepo.failProfileAnalysisRecord).toHaveBeenCalled();
    expect(analysisJobService.failAnalysisJob).toHaveBeenCalled();
    expect(profileService.markOnboardingFailed).toHaveBeenCalled();
  });

  it("does not mark completed onboarding failed when a reanalysis job fails", async () => {
    const reanalysisJob = {
      ...job,
      id: "job_reanalysis_1",
      type: "JOB_ANALYSIS" as const,
    };
    analysisJobRepo.findAnalysisJobByIdRecord.mockResolvedValue(reanalysisJob);
    analysisJobService.claimAnalysisJobForRun.mockResolvedValue({
      ...reanalysisJob,
      status: "RUNNING",
    });
    providerFactory.getAIProvider.mockReturnValue({
      generateStructured: vi.fn(async () => {
        throw Object.assign(new Error("provider unavailable detail"), {
          code: "PROVIDER_UNAVAILABLE",
        });
      }),
    });
    const { runMVPProfileAnalysisJob } = await import(
      "@/lib/services/mvp-profile-analysis-service"
    );

    await expect(runMVPProfileAnalysisJob("job_reanalysis_1")).rejects.toMatchObject({
      code: "PROFILE_ANALYSIS_FAILED",
    });
    expect(profileAnalysisRepo.failProfileAnalysisRecord).toHaveBeenCalled();
    expect(analysisJobService.failAnalysisJob).toHaveBeenCalled();
    expect(profileService.markOnboardingFailed).not.toHaveBeenCalled();
  });
});
