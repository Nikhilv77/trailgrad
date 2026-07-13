import { afterEach, describe, expect, it, vi } from "vitest";

import type { OnboardingSubmission } from "@/lib/onboarding/types";

const completedOnboarding: OnboardingSubmission = {
  targetRole: "ai-engineer",
  experienceLevel: "mid-level",
  noDateYet: true,
  preparationTimePerDay: "30",
  preparationIntensity: "standard",
  resumeName: "resume.pdf",
  resumeContentType: "application/pdf",
  resumeSize: 120_000,
  resumeUploadedAt: "2026-01-01T00:00:00.000Z",
  targetJobMode: "skip",
  projectsMode: "skip",
};

const extractedResumeVersion = {
  id: "resume_version_1",
  profileId: "user_reanalysis_route",
  sourceDocumentId: "source_1",
  version: 1,
  extractedTextStatus: "EXTRACTED",
  extractedText: "TRAILGRAD_SYNTHETIC_FIXTURE resume text",
  errorCode: null,
  active: true,
  createdAt: "2026-01-01T00:00:00.000Z",
};

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("profile reanalysis route", () => {
  it("queues a job analysis after saving updated target inputs", async () => {
    vi.doMock("@clerk/nextjs/server", () => ({
      auth: vi.fn(async () => ({ userId: "user_reanalysis_route" })),
    }));
    vi.doMock("@/lib/db/analysis-job-repository", () => ({
      findAnalysisJobByIdRecord: vi.fn(),
    }));
    vi.doMock("@/lib/db/profile-analysis-repository", () => ({
      findLatestCompletedProfileAnalysisRecord: vi.fn(),
    }));

    const inngest = {
      send: vi.fn(async () => undefined),
    };
    const createProfileAnalysisRequestedEvent = vi.fn((data) => ({
      name: "trailgrad/profile.analysis.requested",
      data,
    }));

    vi.doMock("@/lib/inngest/client", () => ({
      inngest,
      createProfileAnalysisRequestedEvent,
    }));

    const analysisJobs = {
      buildAnalysisJobIdempotencyKey: vi.fn(
        () => "JOB_ANALYSIS:user_reanalysis_route:source_1:fingerprint",
      ),
      requestAnalysisJob: vi.fn(async () => ({
        job: {
          id: "job_reanalysis_1",
          attemptCount: 0,
        },
        duplicate: false,
      })),
    };

    vi.doMock("@/lib/services/analysis-job-service", () => analysisJobs);

    const profileService = {
      getOnboardingState: vi.fn(async () => ({
        status: "completed",
        currentStep: "review",
        startedAt: "2026-01-01T00:00:00.000Z",
        completedAt: "2026-01-01T00:05:00.000Z",
        analysisError: null,
        onboarding: completedOnboarding,
      })),
      listResumeVersions: vi.fn(async () => [extractedResumeVersion]),
      markOnboardingCompleted: vi.fn(async () => undefined),
    };

    vi.doMock("@/lib/services/profile-service", () => profileService);

    const { POST } = await import("@/app/api/profile/reanalysis/route");
    const response = await POST(
      new Request("http://localhost/api/profile/reanalysis", {
        method: "POST",
        body: JSON.stringify({
          targetRole: "product",
          targetCompany: "Fictional Commerce Co",
          targetJobTitle: "Product Manager",
          targetJobMode: "paste",
          jobDescription:
            "TRAILGRAD_SYNTHETIC_FIXTURE Product manager role for checkout experiments.",
          preparationTimePerDay: "60",
          preparationIntensity: "intensive",
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      analysisJobId: "job_reanalysis_1",
      duplicate: false,
      status: "queued",
    });
    expect(profileService.markOnboardingCompleted).toHaveBeenCalledWith(
      "user_reanalysis_route",
      expect.objectContaining({
        targetRole: "product",
        targetCompany: "Fictional Commerce Co",
        targetJobTitle: "Product Manager",
        targetJobMode: "paste",
        jobDescription:
          "TRAILGRAD_SYNTHETIC_FIXTURE Product manager role for checkout experiments.",
        preparationTimePerDay: "60",
        preparationIntensity: "intensive",
      }),
    );
    expect(analysisJobs.buildAnalysisJobIdempotencyKey).toHaveBeenCalledWith(
      expect.objectContaining({
        inputFingerprint: expect.any(String),
        profileId: "user_reanalysis_route",
        sourceDocumentId: "source_1",
        type: "JOB_ANALYSIS",
      }),
    );
    expect(analysisJobs.requestAnalysisJob).toHaveBeenCalledWith(
      expect.objectContaining({
        profileId: "user_reanalysis_route",
        sourceDocumentId: "source_1",
        type: "JOB_ANALYSIS",
      }),
    );
    expect(createProfileAnalysisRequestedEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotencyKey: "JOB_ANALYSIS:user_reanalysis_route:source_1:fingerprint",
        profileId: "user_reanalysis_route",
        sourceDocumentId: "source_1",
        type: "JOB_ANALYSIS",
      }),
    );
    expect(inngest.send).toHaveBeenCalledOnce();
  });

  it("rejects pasted job mode without a job description", async () => {
    vi.doMock("@clerk/nextjs/server", () => ({
      auth: vi.fn(async () => ({ userId: "user_reanalysis_route" })),
    }));
    vi.doMock("@/lib/db/analysis-job-repository", () => ({
      findAnalysisJobByIdRecord: vi.fn(),
    }));
    vi.doMock("@/lib/db/profile-analysis-repository", () => ({
      findLatestCompletedProfileAnalysisRecord: vi.fn(),
    }));

    const { POST } = await import("@/app/api/profile/reanalysis/route");
    const response = await POST(
      new Request("http://localhost/api/profile/reanalysis", {
        method: "POST",
        body: JSON.stringify({
          targetRole: "product",
          targetJobMode: "paste",
          preparationTimePerDay: "30",
          preparationIntensity: "standard",
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: "REANALYSIS_INVALID_INPUT",
    });
  });

  it("rejects unsupported target roles", async () => {
    vi.doMock("@clerk/nextjs/server", () => ({
      auth: vi.fn(async () => ({ userId: "user_reanalysis_route" })),
    }));
    vi.doMock("@/lib/db/analysis-job-repository", () => ({
      findAnalysisJobByIdRecord: vi.fn(),
    }));
    vi.doMock("@/lib/db/profile-analysis-repository", () => ({
      findLatestCompletedProfileAnalysisRecord: vi.fn(),
    }));

    const { POST } = await import("@/app/api/profile/reanalysis/route");
    const response = await POST(
      new Request("http://localhost/api/profile/reanalysis", {
        method: "POST",
        body: JSON.stringify({
          targetRole: "definitely-not-a-real-role",
          targetJobMode: "skip",
          preparationTimePerDay: "30",
          preparationIntensity: "standard",
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: "REANALYSIS_INVALID_INPUT",
    });
  });

  it("requires completed onboarding before reanalysis", async () => {
    vi.doMock("@clerk/nextjs/server", () => ({
      auth: vi.fn(async () => ({ userId: "user_reanalysis_route" })),
    }));
    vi.doMock("@/lib/db/analysis-job-repository", () => ({
      findAnalysisJobByIdRecord: vi.fn(),
    }));
    vi.doMock("@/lib/db/profile-analysis-repository", () => ({
      findLatestCompletedProfileAnalysisRecord: vi.fn(),
    }));
    vi.doMock("@/lib/services/profile-service", () => ({
      getOnboardingState: vi.fn(async () => ({
        status: "analyzing",
        currentStep: "review",
        startedAt: "2026-01-01T00:00:00.000Z",
        completedAt: null,
        analysisError: null,
        onboarding: completedOnboarding,
      })),
      listResumeVersions: vi.fn(),
      markOnboardingCompleted: vi.fn(),
    }));

    const { POST } = await import("@/app/api/profile/reanalysis/route");
    const response = await POST(
      new Request("http://localhost/api/profile/reanalysis", {
        method: "POST",
        body: JSON.stringify({
          targetRole: "product",
          targetJobMode: "skip",
          preparationTimePerDay: "30",
          preparationIntensity: "standard",
        }),
      }),
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      code: "ONBOARDING_NOT_COMPLETE",
    });
  });

  it("returns reanalysis job status for the authenticated owner", async () => {
    vi.doMock("@clerk/nextjs/server", () => ({
      auth: vi.fn(async () => ({ userId: "user_reanalysis_route" })),
    }));
    vi.doMock("@/lib/db/analysis-job-repository", () => ({
      findAnalysisJobByIdRecord: vi.fn(async () => ({
        id: "job_reanalysis_1",
        profileId: "user_reanalysis_route",
        sourceDocumentId: "source_1",
        type: "JOB_ANALYSIS",
        status: "COMPLETED",
        currentStage: "finalization",
        progressPercent: 100,
        idempotencyKey: "JOB_ANALYSIS:user_reanalysis_route:source_1:fingerprint",
        attemptCount: 1,
        safeErrorCode: null,
        safeErrorMessage: null,
        startedAt: "2026-01-01T00:00:00.000Z",
        completedAt: "2026-01-01T00:01:00.000Z",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:01:00.000Z",
      })),
    }));
    vi.doMock("@/lib/db/profile-analysis-repository", () => ({
      findLatestCompletedProfileAnalysisRecord: vi.fn(async () => ({
        updatedAt: "2026-01-01T00:01:05.000Z",
      })),
    }));

    const { GET } = await import("@/app/api/profile/reanalysis/route");
    const response = await GET(
      new Request(
        "http://localhost/api/profile/reanalysis?jobId=job_reanalysis_1",
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      job: {
        id: "job_reanalysis_1",
        status: "COMPLETED",
        progressPercent: 100,
      },
      latestAnalysisUpdatedAt: "2026-01-01T00:01:05.000Z",
    });
  });
});
