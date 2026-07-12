import { afterEach, describe, expect, it, vi } from "vitest";

import type { OnboardingSubmission } from "@/lib/onboarding/types";

const onboardingPayload: OnboardingSubmission = {
  targetRole: "ai-engineer",
  experienceLevel: "junior",
  noDateYet: true,
  preparationTimePerDay: "30",
  preparationIntensity: "standard",
  resumeName: "resume.pdf",
  targetJobMode: "skip",
  projectsMode: "skip",
};

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("onboarding profile route", () => {
  it("surfaces a failed analysis job while profile status is still analyzing", async () => {
    vi.doMock("@clerk/nextjs/server", () => ({
      auth: vi.fn(async () => ({ userId: "user_onboarding_route" })),
    }));
    vi.doMock("@/lib/inngest/client", () => ({
      inngest: {
        send: vi.fn(),
      },
      createProfileAnalysisRequestedEvent: vi.fn(),
    }));
    vi.doMock("@/lib/services/analysis-job-service", () => ({
      buildAnalysisJobIdempotencyKey: vi.fn(
        () => "INITIAL_PROFILE:user_onboarding_route:source_1",
      ),
      requestAnalysisJob: vi.fn(),
    }));
    vi.doMock("@/lib/db/analysis-job-repository", () => ({
      findAnalysisJobByIdempotencyKeyRecord: vi.fn(async () => ({
        id: "job_1",
        status: "FAILED",
        safeErrorMessage: "The AI provider rate limit was reached.",
      })),
    }));

    vi.doMock("@/lib/services/profile-service", () => ({
      getOnboardingState: vi.fn(async () => ({
        status: "analyzing",
        currentStep: "review",
        startedAt: "2026-01-01T00:00:00.000Z",
        completedAt: null,
        analysisError: null,
        onboarding: onboardingPayload,
      })),
      listResumeVersions: vi.fn(async () => [
        {
          id: "resume_version_1",
          profileId: "user_onboarding_route",
          sourceDocumentId: "source_1",
          version: 1,
          extractedTextStatus: "EXTRACTED",
          extractedText: "TRAILGRAD_SYNTHETIC_FIXTURE resume text",
          errorCode: null,
          active: true,
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ]),
      markOnboardingAnalyzing: vi.fn(),
      markOnboardingFailed: vi.fn(),
      updateOnboardingStep: vi.fn(),
    }));

    const { GET } = await import("@/app/api/profile/onboarding/route");
    const response = await GET();

    await expect(response.json()).resolves.toMatchObject({
      status: "failed",
      analysisError: "The AI provider rate limit was reached.",
    });
  });

  it("queues an initial profile analysis job after saving the submission", async () => {
    vi.doMock("@clerk/nextjs/server", () => ({
      auth: vi.fn(async () => ({ userId: "user_onboarding_route" })),
    }));
    const inngest = {
      send: vi.fn(async () => undefined),
    };

    vi.doMock("@/lib/inngest/client", () => ({
      inngest,
      createProfileAnalysisRequestedEvent: vi.fn((data) => ({
        name: "trailgrad/profile.analysis.requested",
        data,
      })),
    }));
    const analysisJobs = {
      buildAnalysisJobIdempotencyKey: vi.fn(
        () => "INITIAL_PROFILE:user_onboarding_route:source_1",
      ),
      requestAnalysisJob: vi.fn(async () => ({
        job: {
          id: "job_1",
        },
        duplicate: false,
      })),
    };

    vi.doMock("@/lib/services/analysis-job-service", () => analysisJobs);

    const services = {
      getOnboardingState: vi.fn(),
      listResumeVersions: vi.fn(async () => [
        {
          id: "resume_version_1",
          profileId: "user_onboarding_route",
          sourceDocumentId: "source_1",
          version: 1,
          extractedTextStatus: "EXTRACTED",
          extractedText: "TRAILGRAD_SYNTHETIC_FIXTURE resume text",
          errorCode: null,
          active: true,
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ]),
      markOnboardingAnalyzing: vi.fn(async () => ({
        onboardingStatus: "analyzing",
        currentOnboardingStep: "review",
        onboardingStartedAt: "2026-01-01T00:00:00.000Z",
        onboardingCompletedAt: null,
        analysisError: null,
        onboarding: onboardingPayload,
      })),
      markOnboardingFailed: vi.fn(async () => undefined),
      updateOnboardingStep: vi.fn(),
    };

    vi.doMock("@/lib/services/profile-service", () => services);

    const { POST } = await import("@/app/api/profile/onboarding/route");
    const response = await POST(
      new Request("http://localhost/api/profile/onboarding", {
        method: "POST",
        body: JSON.stringify(onboardingPayload),
      }),
    );

    await expect(response.json()).resolves.toMatchObject({
      status: "analyzing",
      currentStep: "review",
      completedAt: null,
      analysisJobId: "job_1",
    });
    expect(services.markOnboardingAnalyzing).toHaveBeenCalledWith(
      "user_onboarding_route",
      onboardingPayload,
    );
    expect(analysisJobs.requestAnalysisJob).toHaveBeenCalledOnce();
    expect(inngest.send).toHaveBeenCalledOnce();
  });

  it("uses a fresh Inngest event id when retrying a duplicate failed job", async () => {
    vi.spyOn(Date, "now").mockReturnValue(12345);
    vi.doMock("@clerk/nextjs/server", () => ({
      auth: vi.fn(async () => ({ userId: "user_onboarding_route" })),
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
    vi.doMock("@/lib/db/analysis-job-repository", () => ({
      findAnalysisJobByIdempotencyKeyRecord: vi.fn(),
    }));
    vi.doMock("@/lib/services/analysis-job-service", () => ({
      buildAnalysisJobIdempotencyKey: vi.fn(
        () => "INITIAL_PROFILE:user_onboarding_route:source_1",
      ),
      requestAnalysisJob: vi.fn(async () => ({
        job: {
          id: "job_1",
          attemptCount: 4,
        },
        duplicate: true,
      })),
    }));

    vi.doMock("@/lib/services/profile-service", () => ({
      getOnboardingState: vi.fn(),
      listResumeVersions: vi.fn(async () => [
        {
          id: "resume_version_1",
          profileId: "user_onboarding_route",
          sourceDocumentId: "source_1",
          version: 1,
          extractedTextStatus: "EXTRACTED",
          extractedText: "TRAILGRAD_SYNTHETIC_FIXTURE resume text",
          errorCode: null,
          active: true,
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ]),
      markOnboardingAnalyzing: vi.fn(async () => ({
        onboardingStatus: "analyzing",
        currentOnboardingStep: "review",
        onboardingStartedAt: "2026-01-01T00:00:00.000Z",
        onboardingCompletedAt: null,
        analysisError: null,
        onboarding: onboardingPayload,
      })),
      markOnboardingFailed: vi.fn(async () => undefined),
      updateOnboardingStep: vi.fn(),
    }));

    const { POST } = await import("@/app/api/profile/onboarding/route");
    const response = await POST(
      new Request("http://localhost/api/profile/onboarding", {
        method: "POST",
        body: JSON.stringify(onboardingPayload),
      }),
    );

    expect(response.status).toBe(200);
    expect(createProfileAnalysisRequestedEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotencyKey: "INITIAL_PROFILE:user_onboarding_route:source_1",
        eventId: "INITIAL_PROFILE:user_onboarding_route:source_1:retry:5:12345",
      }),
    );
    expect(inngest.send).toHaveBeenCalledOnce();
  });

  it("returns a clear queue error when Inngest is not available", async () => {
    vi.doMock("@clerk/nextjs/server", () => ({
      auth: vi.fn(async () => ({ userId: "user_onboarding_route" })),
    }));
    vi.doMock("@/lib/inngest/client", () => ({
      inngest: {
        send: vi.fn(async () => {
          throw new Error("No Inngest dev server");
        }),
      },
      createProfileAnalysisRequestedEvent: vi.fn((data) => ({
        name: "trailgrad/profile.analysis.requested",
        data,
      })),
    }));
    vi.doMock("@/lib/services/analysis-job-service", () => ({
      buildAnalysisJobIdempotencyKey: vi.fn(
        () => "INITIAL_PROFILE:user_onboarding_route:source_1",
      ),
      requestAnalysisJob: vi.fn(async () => ({
        job: {
          id: "job_1",
        },
        duplicate: false,
      })),
    }));

    const services = {
      getOnboardingState: vi.fn(),
      listResumeVersions: vi.fn(async () => [
        {
          id: "resume_version_1",
          profileId: "user_onboarding_route",
          sourceDocumentId: "source_1",
          version: 1,
          extractedTextStatus: "EXTRACTED",
          extractedText: "TRAILGRAD_SYNTHETIC_FIXTURE resume text",
          errorCode: null,
          active: true,
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ]),
      markOnboardingAnalyzing: vi.fn(async () => ({
        onboardingStatus: "analyzing",
        currentOnboardingStep: "review",
        onboardingStartedAt: "2026-01-01T00:00:00.000Z",
        onboardingCompletedAt: null,
        analysisError: null,
        onboarding: onboardingPayload,
      })),
      markOnboardingFailed: vi.fn(async () => undefined),
      updateOnboardingStep: vi.fn(),
    };

    vi.doMock("@/lib/services/profile-service", () => services);

    const { POST } = await import("@/app/api/profile/onboarding/route");
    const response = await POST(
      new Request("http://localhost/api/profile/onboarding", {
        method: "POST",
        body: JSON.stringify(onboardingPayload),
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      code: "ANALYSIS_QUEUE_UNAVAILABLE",
      error: expect.stringContaining("Inngest dev server"),
    });
    expect(services.markOnboardingFailed).toHaveBeenCalledWith(
      "user_onboarding_route",
      expect.stringContaining("could not queue"),
    );
  });
});
