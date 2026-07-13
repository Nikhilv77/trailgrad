import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("resume upload route", () => {
  it("rejects unauthenticated uploads", async () => {
    vi.doMock("@clerk/nextjs/server", () => ({
      auth: vi.fn(async () => ({ userId: null })),
    }));
    vi.doMock("@/lib/resume/upload-service", () => ({
      uploadAuthenticatedResume: vi.fn(),
    }));

    const { POST } = await import("@/app/api/profile/onboarding/resume/route");
    const response = await POST(
      new Request("http://localhost/api/profile/onboarding/resume", {
        method: "POST",
        body: new FormData(),
      }),
    );

    await expect(response.json()).resolves.toMatchObject({
      code: "AUTHENTICATION_REQUIRED",
    });
    expect(response.status).toBe(401);
  });

  it("returns a safe code for non-resume documents", async () => {
    vi.doMock("@clerk/nextjs/server", () => ({
      auth: vi.fn(async () => ({ userId: "user_resume" })),
    }));
    vi.doMock("@/lib/resume/upload-service", () => ({
      uploadAuthenticatedResume: vi.fn(async () => {
        const { ResumeUploadError } = await import("@/lib/resume/upload-errors");
        throw new ResumeUploadError("RESUME_NOT_DETECTED");
      }),
    }));

    const formData = new FormData();
    formData.append(
      "resume",
      new File(["not a resume"], "notes.pdf", { type: "application/pdf" }),
    );

    const { POST } = await import("@/app/api/profile/onboarding/resume/route");
    const response = await POST(
      new Request("http://localhost/api/profile/onboarding/resume", {
        method: "POST",
        body: formData,
      }),
    );

    await expect(response.json()).resolves.toMatchObject({
      code: "RESUME_NOT_DETECTED",
    });
    expect(response.status).toBe(400);
  });

  it("returns a safe code for files that are too long to be resumes", async () => {
    vi.doMock("@clerk/nextjs/server", () => ({
      auth: vi.fn(async () => ({ userId: "user_resume" })),
    }));
    vi.doMock("@/lib/resume/upload-service", () => ({
      uploadAuthenticatedResume: vi.fn(async () => {
        const { ResumeUploadError } = await import("@/lib/resume/upload-errors");
        throw new ResumeUploadError("RESUME_TOO_LONG");
      }),
    }));

    const formData = new FormData();
    formData.append(
      "resume",
      new File(["long product doc"], "product-spec.pdf", { type: "application/pdf" }),
    );

    const { POST } = await import("@/app/api/profile/onboarding/resume/route");
    const response = await POST(
      new Request("http://localhost/api/profile/onboarding/resume", {
        method: "POST",
        body: formData,
      }),
    );

    await expect(response.json()).resolves.toMatchObject({
      code: "RESUME_TOO_LONG",
    });
    expect(response.status).toBe(400);
  });
});
