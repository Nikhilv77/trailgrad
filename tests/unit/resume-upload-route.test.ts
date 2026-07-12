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
});
