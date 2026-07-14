import { afterEach, describe, expect, it, vi } from "vitest";

const extractedResumeVersion = {
  id: "resume_version_1",
  profileId: "user_application_route",
  sourceDocumentId: "source_1",
  version: 1,
  extractedTextStatus: "EXTRACTED",
  extractedText: "TRAILGRAD_SYNTHETIC_FIXTURE resume text",
  errorCode: null,
  active: true,
  createdAt: "2026-01-01T00:00:00.000Z",
};

const savedApplication = {
  id: "application_1",
  profileId: "user_application_route",
  targetContextId: "target_application_1",
  trailFocus: "job",
  targetRole: "product",
  experienceLevel: "mid-level",
  targetCompany: "Fictional Commerce Co",
  targetJobTitle: "Product Manager",
  applicationDate: null,
  noDateYet: true,
  preparationTimePerDay: "60",
  preparationIntensity: "intensive",
  targetJobMode: "paste",
  jobDescription:
    "TRAILGRAD_SYNTHETIC_FIXTURE Product manager role for checkout experiments.",
  analysisJobId: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("application analysis route", () => {
  it("queues a job analysis after creating an application", async () => {
    vi.doMock("@clerk/nextjs/server", () => ({
      auth: vi.fn(async () => ({ userId: "user_application_route" })),
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
        () => "JOB_ANALYSIS:user_application_route:source_1:fingerprint",
      ),
      requestAnalysisJob: vi.fn(async () => ({
        job: {
          id: "job_application_1",
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
        onboarding: {
          targetRole: "product",
          experienceLevel: "mid-level",
          resumeName: "resume.pdf",
        },
      })),
      listResumeVersions: vi.fn(async () => [extractedResumeVersion]),
    };

    vi.doMock("@/lib/services/profile-service", () => profileService);

    const applicationRepository = {
      createJobApplicationRecord: vi.fn(async () => savedApplication),
      attachAnalysisJobToApplicationRecord: vi.fn(async () => ({
        ...savedApplication,
        analysisJobId: "job_application_1",
      })),
      listJobApplicationRecords: vi.fn(async () => []),
    };

    vi.doMock("@/lib/db/application-repository", () => applicationRepository);

    const { POST } = await import("@/app/api/applications/route");
    const response = await POST(
      new Request("http://localhost/api/applications", {
        method: "POST",
        body: JSON.stringify({
          targetCompany: "Fictional Commerce Co",
          targetJobTitle: "Product Manager",
          noDateYet: true,
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
      analysisJobId: "job_application_1",
      duplicate: false,
      status: "queued",
      application: {
        id: "application_1",
        analysisJobId: "job_application_1",
      },
    });
    expect(applicationRepository.createJobApplicationRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        profileId: "user_application_route",
        application: expect.objectContaining({
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
    expect(analysisJobs.buildAnalysisJobIdempotencyKey).toHaveBeenCalledWith(
      expect.objectContaining({
        inputFingerprint: expect.stringContaining("application_1:"),
        profileId: "user_application_route",
        sourceDocumentId: "source_1",
        type: "JOB_ANALYSIS",
      }),
    );
    expect(analysisJobs.requestAnalysisJob).toHaveBeenCalledWith(
      expect.objectContaining({
        profileId: "user_application_route",
        sourceDocumentId: "source_1",
        targetContextId: "target_application_1",
        type: "JOB_ANALYSIS",
      }),
    );
    expect(createProfileAnalysisRequestedEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotencyKey: "JOB_ANALYSIS:user_application_route:source_1:fingerprint",
        profileId: "user_application_route",
        sourceDocumentId: "source_1",
        targetContextId: "target_application_1",
        type: "JOB_ANALYSIS",
      }),
    );
    expect(inngest.send).toHaveBeenCalledOnce();
  });

  it("preserves learning trail focus when creating the first trail", async () => {
    vi.doMock("@clerk/nextjs/server", () => ({
      auth: vi.fn(async () => ({ userId: "user_application_route" })),
    }));
    vi.doMock("@/lib/db/analysis-job-repository", () => ({
      findAnalysisJobByIdRecord: vi.fn(),
    }));
    vi.doMock("@/lib/db/profile-analysis-repository", () => ({
      findLatestCompletedProfileAnalysisRecord: vi.fn(),
    }));

    vi.doMock("@/lib/inngest/client", () => ({
      inngest: {
        send: vi.fn(async () => undefined),
      },
      createProfileAnalysisRequestedEvent: vi.fn((data) => ({
        name: "trailgrad/profile.analysis.requested",
        data,
      })),
    }));

    vi.doMock("@/lib/services/analysis-job-service", () => ({
      buildAnalysisJobIdempotencyKey: vi.fn(
        () => "JOB_ANALYSIS:user_application_route:source_1:fingerprint",
      ),
      requestAnalysisJob: vi.fn(async () => ({
        job: {
          id: "job_application_1",
          attemptCount: 0,
        },
        duplicate: false,
      })),
    }));

    vi.doMock("@/lib/services/profile-service", () => ({
      getOnboardingState: vi.fn(async () => ({
        status: "completed",
        currentStep: "review",
        startedAt: "2026-01-01T00:00:00.000Z",
        completedAt: "2026-01-01T00:05:00.000Z",
        analysisError: null,
        onboarding: {
          targetRole: "product",
          experienceLevel: "mid-level",
          resumeName: "resume.pdf",
        },
      })),
      listResumeVersions: vi.fn(async () => [extractedResumeVersion]),
    }));

    const learningApplication = {
      ...savedApplication,
      trailFocus: "learning",
      targetCompany: "Portfolio",
      targetJobTitle: "Ship a full-stack project",
      jobDescription:
        "TRAILGRAD_SYNTHETIC_FIXTURE Build a portfolio project with a clear launch story.",
    };
    const applicationRepository = {
      createJobApplicationRecord: vi.fn(async () => learningApplication),
      attachAnalysisJobToApplicationRecord: vi.fn(async () => ({
        ...learningApplication,
        analysisJobId: "job_application_1",
      })),
      listJobApplicationRecords: vi.fn(async () => []),
    };

    vi.doMock("@/lib/db/application-repository", () => applicationRepository);

    const { POST } = await import("@/app/api/applications/route");
    const response = await POST(
      new Request("http://localhost/api/applications", {
        method: "POST",
        body: JSON.stringify({
          trailFocus: "learning",
          targetCompany: "Portfolio",
          targetJobTitle: "Ship a full-stack project",
          noDateYet: true,
          targetJobMode: "paste",
          jobDescription:
            "TRAILGRAD_SYNTHETIC_FIXTURE Build a portfolio project with a clear launch story.",
          preparationTimePerDay: "30",
          preparationIntensity: "standard",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(applicationRepository.createJobApplicationRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        application: expect.objectContaining({
          trailFocus: "learning",
          targetCompany: "Portfolio",
          targetJobTitle: "Ship a full-stack project",
          targetJobMode: "paste",
        }),
      }),
    );
    await expect(response.json()).resolves.toMatchObject({
      application: {
        trailFocus: "learning",
      },
      status: "queued",
    });
  });

  it("rejects pasted job mode without a job description", async () => {
    vi.doMock("@clerk/nextjs/server", () => ({
      auth: vi.fn(async () => ({ userId: "user_application_route" })),
    }));
    vi.doMock("@/lib/services/profile-service", () => ({
      getOnboardingState: vi.fn(async () => ({
        status: "completed",
        currentStep: "review",
        startedAt: "2026-01-01T00:00:00.000Z",
        completedAt: "2026-01-01T00:05:00.000Z",
        analysisError: null,
        onboarding: {
          targetRole: "product",
          experienceLevel: "mid-level",
          resumeName: "resume.pdf",
        },
      })),
      listResumeVersions: vi.fn(async () => [extractedResumeVersion]),
    }));
    vi.doMock("@/lib/db/application-repository", () => ({
      createJobApplicationRecord: vi.fn(),
      attachAnalysisJobToApplicationRecord: vi.fn(),
      listJobApplicationRecords: vi.fn(async () => []),
    }));

    const { POST } = await import("@/app/api/applications/route");
    const response = await POST(
      new Request("http://localhost/api/applications", {
        method: "POST",
        body: JSON.stringify({
          noDateYet: true,
          targetJobMode: "paste",
          preparationTimePerDay: "30",
          preparationIntensity: "standard",
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: "APPLICATION_INVALID_INPUT",
    });
  });

  it("allows creating another trail after one already exists", async () => {
    vi.doMock("@clerk/nextjs/server", () => ({
      auth: vi.fn(async () => ({ userId: "user_application_route" })),
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
    vi.doMock("@/lib/services/analysis-job-service", () => ({
      buildAnalysisJobIdempotencyKey: vi.fn(
        () => "JOB_ANALYSIS:user_application_route:source_1:fingerprint_2",
      ),
      requestAnalysisJob: vi.fn(async () => ({
        job: {
          id: "job_application_2",
          attemptCount: 0,
        },
        duplicate: false,
      })),
    }));
    vi.doMock("@/lib/services/profile-service", () => ({
      getOnboardingState: vi.fn(async () => ({
        status: "completed",
        currentStep: "review",
        startedAt: "2026-01-01T00:00:00.000Z",
        completedAt: "2026-01-01T00:05:00.000Z",
        analysisError: null,
        onboarding: {
          targetRole: "product",
          experienceLevel: "mid-level",
          resumeName: "resume.pdf",
        },
      })),
      listResumeVersions: vi.fn(async () => [extractedResumeVersion]),
    }));

    const secondApplication = {
      ...savedApplication,
      id: "application_2",
      targetContextId: "target_application_2",
      analysisJobId: null,
    };
    const applicationRepository = {
      createJobApplicationRecord: vi.fn(async () => secondApplication),
      attachAnalysisJobToApplicationRecord: vi.fn(async () => ({
        ...secondApplication,
        analysisJobId: "job_application_2",
      })),
      listJobApplicationRecords: vi.fn(async () => [savedApplication]),
    };

    vi.doMock("@/lib/db/application-repository", () => applicationRepository);

    const { POST } = await import("@/app/api/applications/route");
    const response = await POST(
      new Request("http://localhost/api/applications", {
        method: "POST",
        body: JSON.stringify({
          noDateYet: true,
          targetJobMode: "skip",
          preparationTimePerDay: "30",
          preparationIntensity: "standard",
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      analysisJobId: "job_application_2",
      status: "queued",
      application: {
        id: "application_2",
        analysisJobId: "job_application_2",
      },
    });
    expect(applicationRepository.createJobApplicationRecord).toHaveBeenCalledOnce();
    expect(inngest.send).toHaveBeenCalledOnce();
  });

  it("requires completed onboarding with role and experience defaults", async () => {
    vi.doMock("@clerk/nextjs/server", () => ({
      auth: vi.fn(async () => ({ userId: "user_application_route" })),
    }));
    vi.doMock("@/lib/services/profile-service", () => ({
      getOnboardingState: vi.fn(async () => ({
        status: "completed",
        currentStep: "review",
        startedAt: "2026-01-01T00:00:00.000Z",
        completedAt: "2026-01-01T00:05:00.000Z",
        analysisError: null,
        onboarding: {
          resumeName: "resume.pdf",
        },
      })),
      listResumeVersions: vi.fn(async () => [extractedResumeVersion]),
    }));
    vi.doMock("@/lib/db/application-repository", () => ({
      createJobApplicationRecord: vi.fn(),
      attachAnalysisJobToApplicationRecord: vi.fn(),
      listJobApplicationRecords: vi.fn(),
    }));

    const { POST } = await import("@/app/api/applications/route");
    const response = await POST(
      new Request("http://localhost/api/applications", {
        method: "POST",
        body: JSON.stringify({
          noDateYet: true,
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

  it("requires completed onboarding before application creation", async () => {
    vi.doMock("@clerk/nextjs/server", () => ({
      auth: vi.fn(async () => ({ userId: "user_application_route" })),
    }));
    vi.doMock("@/lib/services/profile-service", () => ({
      getOnboardingState: vi.fn(async () => ({
        status: "in_progress",
        currentStep: "resume",
        startedAt: "2026-01-01T00:00:00.000Z",
        completedAt: null,
        analysisError: null,
        onboarding: {
          targetRole: "product",
          experienceLevel: "mid-level",
          resumeName: "resume.pdf",
        },
      })),
      listResumeVersions: vi.fn(),
    }));
    vi.doMock("@/lib/db/application-repository", () => ({
      createJobApplicationRecord: vi.fn(),
      attachAnalysisJobToApplicationRecord: vi.fn(),
      listJobApplicationRecords: vi.fn(),
    }));

    const { POST } = await import("@/app/api/applications/route");
    const response = await POST(
      new Request("http://localhost/api/applications", {
        method: "POST",
        body: JSON.stringify({
          noDateYet: true,
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

  it("returns analysis job status for the authenticated owner", async () => {
    vi.doMock("@clerk/nextjs/server", () => ({
      auth: vi.fn(async () => ({ userId: "user_application_route" })),
    }));
    vi.doMock("@/lib/db/analysis-job-repository", () => ({
      findAnalysisJobByIdRecord: vi.fn(async () => ({
        id: "job_application_1",
        profileId: "user_application_route",
        sourceDocumentId: "source_1",
        targetContextId: "target_application_1",
        type: "JOB_ANALYSIS",
        status: "COMPLETED",
        currentStage: "finalization",
        progressPercent: 100,
        idempotencyKey: "JOB_ANALYSIS:user_application_route:source_1:fingerprint",
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
        "http://localhost/api/profile/reanalysis?jobId=job_application_1",
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      job: {
        id: "job_application_1",
        status: "COMPLETED",
        progressPercent: 100,
      },
      latestAnalysisUpdatedAt: "2026-01-01T00:01:05.000Z",
    });
  });
});
