import { afterEach, describe, expect, it, vi } from "vitest";

import type { OnboardingSubmission } from "@/lib/onboarding/types";

const onboardingPayload: OnboardingSubmission = {
  targetRole: "ai-engineer",
  experienceLevel: "junior",
  resumeName: "resume.pdf",
  resumeContentType: "application/pdf",
  resumeSize: 1000,
  resumeUploadedAt: "2026-01-01T00:00:00.000Z",
};

const serverSourceDocument = {
  id: "source_1",
  profileId: "user_onboarding_route",
  sourceType: "resume",
  originalFilename: "server-resume.pdf",
  mimeType: "application/pdf",
  storagePath: "private/resumes/server-resume.pdf",
  fileSize: 42_000,
  sha256ContentHash: "hash_1",
  processingStatus: "EXTRACTED",
  errorCode: null,
  version: 1,
  createdAt: "2026-01-01T00:03:00.000Z",
};

const serverHydratedOnboarding: OnboardingSubmission = {
  targetRole: onboardingPayload.targetRole,
  experienceLevel: onboardingPayload.experienceLevel,
  resumeName: serverSourceDocument.originalFilename,
  resumeContentType: serverSourceDocument.mimeType,
  resumeSize: serverSourceDocument.fileSize,
  resumeUploadedAt: serverSourceDocument.createdAt,
};

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("onboarding profile route", () => {
  it("returns reconciled onboarding state for the authenticated user", async () => {
    vi.doMock("@clerk/nextjs/server", () => ({
      auth: vi.fn(async () => ({ userId: "user_onboarding_route" })),
    }));
    vi.doMock("@/lib/services/onboarding-analysis-status-service", () => ({
      getReconciledOnboardingState: vi.fn(async () => ({
        status: "in_progress",
        currentStep: "resume",
        startedAt: "2026-01-01T00:00:00.000Z",
        completedAt: null,
        analysisError: null,
        onboarding: onboardingPayload,
      })),
    }));
    vi.doMock("@/lib/services/profile-service", () => ({
      listResumeVersions: vi.fn(),
      listSourceDocuments: vi.fn(),
      markOnboardingCompleted: vi.fn(),
      updateOnboardingStep: vi.fn(),
    }));

    const { GET } = await import("@/app/api/profile/onboarding/route");
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      status: "in_progress",
      currentStep: "resume",
      onboarding: onboardingPayload,
    });
  });

  it("completes onboarding with server-hydrated resume metadata", async () => {
    vi.doMock("@clerk/nextjs/server", () => ({
      auth: vi.fn(async () => ({ userId: "user_onboarding_route" })),
    }));
    vi.doMock("@/lib/services/onboarding-analysis-status-service", () => ({
      getReconciledOnboardingState: vi.fn(),
    }));

    const services = {
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
      listSourceDocuments: vi.fn(async () => [serverSourceDocument]),
      markOnboardingCompleted: vi.fn(async () => ({
        onboardingStatus: "completed",
        currentOnboardingStep: "review",
        onboardingStartedAt: "2026-01-01T00:00:00.000Z",
        onboardingCompletedAt: "2026-01-01T00:04:00.000Z",
        analysisError: null,
        onboarding: serverHydratedOnboarding,
      })),
      updateOnboardingStep: vi.fn(),
    };

    vi.doMock("@/lib/services/profile-service", () => services);

    const { POST } = await import("@/app/api/profile/onboarding/route");
    const response = await POST(
      new Request("http://localhost/api/profile/onboarding", {
        method: "POST",
        body: JSON.stringify({
          targetRole: "ai-engineer",
          experienceLevel: "junior",
          resumeName: "fake-client-name.pdf",
          resumeContentType: "text/plain",
          resumeSize: 1,
          resumeUploadedAt: "1999-01-01T00:00:00.000Z",
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      status: "completed",
      currentStep: "review",
      completedAt: "2026-01-01T00:04:00.000Z",
      onboarding: serverHydratedOnboarding,
    });
    expect(services.markOnboardingCompleted).toHaveBeenCalledWith(
      "user_onboarding_route",
      serverHydratedOnboarding,
    );
  });

  it("rejects final submission when extracted resume text is missing", async () => {
    vi.doMock("@clerk/nextjs/server", () => ({
      auth: vi.fn(async () => ({ userId: "user_onboarding_route" })),
    }));
    vi.doMock("@/lib/services/onboarding-analysis-status-service", () => ({
      getReconciledOnboardingState: vi.fn(),
    }));
    vi.doMock("@/lib/services/profile-service", () => ({
      listResumeVersions: vi.fn(async () => []),
      listSourceDocuments: vi.fn(async () => []),
      markOnboardingCompleted: vi.fn(),
      updateOnboardingStep: vi.fn(),
    }));

    const { POST } = await import("@/app/api/profile/onboarding/route");
    const response = await POST(
      new Request("http://localhost/api/profile/onboarding", {
        method: "POST",
        body: JSON.stringify(onboardingPayload),
      }),
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      code: "RESUME_NOT_READY",
    });
  });
});
