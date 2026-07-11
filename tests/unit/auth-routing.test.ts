import { afterEach, describe, expect, it, vi } from "vitest";

const onboardingPayload = {
  role: "ai-engineer",
  experience: "early",
  timeline: "soon",
};

class RedirectError extends Error {
  constructor(readonly url: string) {
    super(`Redirected to ${url}`);
  }
}

async function loadAuthModules(userId: string | null) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "pk_test");
  vi.stubEnv("CLERK_SECRET_KEY", "sk_test");

  const profileRecords = new Map<
    string,
    {
      clerkUserId: string;
      onboardingCompletedAt: string | null;
      onboarding: typeof onboardingPayload | null;
      createdAt: string;
      updatedAt: string;
    }
  >();

  vi.doMock("@/lib/db/profile-repository", () => ({
    getOrCreateProfileRecord: vi.fn(async (clerkUserId: string) => {
      const existingProfile = profileRecords.get(clerkUserId);

      if (existingProfile) {
        return existingProfile;
      }

      const now = new Date().toISOString();
      const profile = {
        clerkUserId,
        onboardingCompletedAt: null,
        onboarding: null,
        createdAt: now,
        updatedAt: now,
      };

      profileRecords.set(clerkUserId, profile);
      return profile;
    }),
    completeProfileOnboardingRecord: vi.fn(
      async (clerkUserId: string, onboarding: typeof onboardingPayload) => {
        const now = new Date().toISOString();
        const existingProfile = profileRecords.get(clerkUserId);
        const profile = {
          clerkUserId,
          onboardingCompletedAt:
            existingProfile?.onboardingCompletedAt ?? now,
          onboarding,
          createdAt: existingProfile?.createdAt ?? now,
          updatedAt: now,
        };

        profileRecords.set(clerkUserId, profile);
        return profile;
      },
    ),
  }));

  vi.doMock("next/navigation", () => ({
    redirect: (url: string) => {
      throw new RedirectError(url);
    },
  }));

  vi.doMock("@clerk/nextjs/server", () => ({
    auth: vi.fn(async () => ({
      userId,
      redirectToSignIn: ({ returnBackUrl }: { returnBackUrl?: string }) => {
        const url = returnBackUrl
          ? `/auth?${new URLSearchParams({ redirect_url: returnBackUrl }).toString()}`
          : "/auth";

        throw new RedirectError(url);
      },
    })),
  }));

  return {
    authServer: await import("@/lib/auth/server"),
    profileService: await import("@/lib/services/profile-service"),
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("authenticated route decisions", () => {
  it("redirects a signed-out user visiting /today to auth", async () => {
    const { authServer } = await loadAuthModules(null);

    await expect(
      authServer.requireCompletedOnboarding({ currentPath: "/today" }),
    ).rejects.toMatchObject({
      url: "/auth?redirect_url=%2Ftoday",
    });
  });

  it("redirects a signed-out user visiting /onboarding to auth", async () => {
    const { profileService } = await loadAuthModules(null);
    vi.doMock("@/components/onboarding/onboarding-flow", () => ({
      OnboardingFlow: () => null,
    }));

    const { default: OnboardingPage } = await import("@/app/onboarding/page");

    await expect(
      OnboardingPage({ searchParams: Promise.resolve({}) }),
    ).rejects.toMatchObject({
      url: "/auth?redirect_url=%2Fonboarding",
    });

    expect(profileService).toBeDefined();
  });

  it("creates a profile and redirects a signed-in new user from /today to onboarding", async () => {
    const userId = "user_new_today";
    const { authServer, profileService } = await loadAuthModules(userId);

    await expect(
      authServer.requireCompletedOnboarding({ currentPath: "/today" }),
    ).rejects.toMatchObject({
      url: "/onboarding?redirect_url=%2Ftoday",
    });

    await expect(
      profileService.readTrailgradOnboardingStatus(userId),
    ).resolves.toMatchObject({
      completed: false,
      profile: {
        clerkUserId: userId,
      },
    });
  });

  it("redirects a signed-in incomplete user from /practice to onboarding", async () => {
    const { authServer } = await loadAuthModules("user_incomplete_practice");

    await expect(
      authServer.requireCompletedOnboarding({ currentPath: "/practice" }),
    ).rejects.toMatchObject({
      url: "/onboarding?redirect_url=%2Fpractice",
    });
  });

  it("redirects a signed-in completed user away from /onboarding to /today", async () => {
    const userId = "user_complete_onboarding";
    const { profileService } = await loadAuthModules(userId);
    await profileService.completeTrailgradOnboarding(userId, onboardingPayload);

    vi.doMock("@/components/onboarding/onboarding-flow", () => ({
      OnboardingFlow: () => null,
    }));

    const { default: OnboardingPage } = await import("@/app/onboarding/page");

    await expect(
      OnboardingPage({ searchParams: Promise.resolve({}) }),
    ).rejects.toMatchObject({
      url: "/today",
    });
  });

  it("allows a signed-in completed user to visit /today", async () => {
    const userId = "user_complete_today";
    const { authServer, profileService } = await loadAuthModules(userId);
    await profileService.completeTrailgradOnboarding(userId, onboardingPayload);

    await expect(
      authServer.requireCompletedOnboarding({ currentPath: "/today" }),
    ).resolves.toMatchObject({
      userId,
      profile: {
        clerkUserId: userId,
        onboardingCompletedAt: expect.any(String),
      },
    });
  });

  it("returns signed-out users to the public landing route", async () => {
    const routes = await import("@/lib/auth/routes");

    expect(routes.SIGN_OUT_REDIRECT_URL).toBe("/");
  });

  it("accepts same-origin app return URLs and rejects external redirects", async () => {
    const { authServer } = await loadAuthModules("user_redirect_parser");

    expect(
      authServer.getSafeAppRedirectPath(
        "http://localhost:3000/practice?round=1",
        "http://localhost:3000",
      ),
    ).toBe("/practice?round=1");
    expect(
      authServer.getSafeAppRedirectPath(
        "https://example.com/practice",
        "http://localhost:3000",
      ),
    ).toBeNull();
  });
});
