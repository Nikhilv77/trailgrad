import { afterEach, describe, expect, it, vi } from "vitest";

const onboardingPayload = {
  targetRole: "ai-engineer",
  experienceLevel: "junior",
  noDateYet: true,
  preparationTimePerDay: "30",
  preparationIntensity: "standard",
  resumeName: "resume.pdf",
  targetJobMode: "skip",
  projectsMode: "skip",
} as const;

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
      onboardingStatus:
        | "not_started"
        | "in_progress"
        | "analyzing"
        | "completed"
        | "failed";
      currentOnboardingStep:
        | "target-role"
        | "timeline"
        | "resume"
        | "target-job"
        | "projects"
        | "review";
      onboardingStartedAt: string | null;
      onboardingCompletedAt: string | null;
      analysisError: string | null;
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
        onboardingStatus: "not_started" as const,
        currentOnboardingStep: "target-role" as const,
        onboardingStartedAt: null,
        onboardingCompletedAt: null,
        analysisError: null,
        onboarding: null,
        createdAt: now,
        updatedAt: now,
      };

      profileRecords.set(clerkUserId, profile);
      return profile;
    }),
    getOnboardingStateRecord: vi.fn(async (clerkUserId: string) => {
      const profile =
        profileRecords.get(clerkUserId) ??
        (await (await import("@/lib/db/profile-repository")).getOrCreateProfileRecord(
          clerkUserId,
        ));

      return {
        status: profile.onboardingStatus,
        currentStep: profile.currentOnboardingStep,
        startedAt: profile.onboardingStartedAt,
        completedAt: profile.onboardingCompletedAt,
        analysisError: profile.analysisError,
        onboarding: profile.onboarding,
      };
    }),
    updateOnboardingStepRecord: vi.fn(
      async (
        clerkUserId: string,
        currentStep:
          | "target-role"
          | "timeline"
          | "resume"
          | "target-job"
          | "projects"
          | "review",
        onboarding: Partial<typeof onboardingPayload>,
      ) => {
        const now = new Date().toISOString();
        const existingProfile = profileRecords.get(clerkUserId);
        const profile = {
          clerkUserId,
          onboardingStatus:
            existingProfile?.onboardingStatus === "completed"
              ? "completed" as const
              : "in_progress" as const,
          currentOnboardingStep: currentStep,
          onboardingStartedAt: existingProfile?.onboardingStartedAt ?? now,
          onboardingCompletedAt: existingProfile?.onboardingCompletedAt ?? null,
          analysisError: null,
          onboarding: {
            ...(existingProfile?.onboarding ?? {}),
            ...onboarding,
          } as typeof onboardingPayload,
          createdAt: existingProfile?.createdAt ?? now,
          updatedAt: now,
        };

        profileRecords.set(clerkUserId, profile);
        return profile;
      },
    ),
    markOnboardingAnalyzingRecord: vi.fn(
      async (clerkUserId: string, onboarding: typeof onboardingPayload) => {
        const now = new Date().toISOString();
        const existingProfile = profileRecords.get(clerkUserId);
        const profile = {
          clerkUserId,
          onboardingStatus: "analyzing" as const,
          currentOnboardingStep: "review" as const,
          onboardingStartedAt: existingProfile?.onboardingStartedAt ?? now,
          onboardingCompletedAt: existingProfile?.onboardingCompletedAt ?? null,
          analysisError: null,
          onboarding,
          createdAt: existingProfile?.createdAt ?? now,
          updatedAt: now,
        };

        profileRecords.set(clerkUserId, profile);
        return profile;
      },
    ),
    completeProfileOnboardingRecord: vi.fn(
      async (clerkUserId: string, onboarding: typeof onboardingPayload) => {
        const now = new Date().toISOString();
        const existingProfile = profileRecords.get(clerkUserId);
        const profile = {
          clerkUserId,
          onboardingStatus: "completed" as const,
          currentOnboardingStep: "review" as const,
          onboardingStartedAt: existingProfile?.onboardingStartedAt ?? now,
          onboardingCompletedAt:
            existingProfile?.onboardingCompletedAt ?? now,
          analysisError: null,
          onboarding,
          createdAt: existingProfile?.createdAt ?? now,
          updatedAt: now,
        };

        profileRecords.set(clerkUserId, profile);
        return profile;
      },
    ),
    markOnboardingFailedRecord: vi.fn(
      async (clerkUserId: string, analysisError: string) => {
        const now = new Date().toISOString();
        const existingProfile = profileRecords.get(clerkUserId);
        const profile = {
          clerkUserId,
          onboardingStatus: "failed" as const,
          currentOnboardingStep: "review" as const,
          onboardingStartedAt: existingProfile?.onboardingStartedAt ?? now,
          onboardingCompletedAt: existingProfile?.onboardingCompletedAt ?? null,
          analysisError,
          onboarding: existingProfile?.onboarding ?? null,
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
  it("creates the first profile idempotently", async () => {
    const userId = "user_first_profile";
    const { profileService } = await loadAuthModules(userId);

    await expect(profileService.getOrCreateProfile(userId)).resolves.toMatchObject({
      clerkUserId: userId,
      onboardingStatus: "not_started",
      currentOnboardingStep: "target-role",
      onboardingCompletedAt: null,
    });
  });

  it("does not create duplicate profiles for repeated creation", async () => {
    const userId = "user_repeated_profile";
    const { profileService } = await loadAuthModules(userId);
    const firstProfile = await profileService.getOrCreateProfile(userId);
    const secondProfile = await profileService.getOrCreateProfile(userId);

    expect(secondProfile).toMatchObject({
      clerkUserId: firstProfile.clerkUserId,
      createdAt: firstProfile.createdAt,
    });
  });

  it("saves an onboarding step", async () => {
    const userId = "user_save_step";
    const { profileService } = await loadAuthModules(userId);

    await expect(
      profileService.updateOnboardingStep(userId, "timeline", {
        targetRole: "ai-engineer",
        experienceLevel: "junior",
      }),
    ).resolves.toMatchObject({
      onboardingStatus: "in_progress",
      currentOnboardingStep: "timeline",
      onboardingStartedAt: expect.any(String),
      onboarding: {
        targetRole: "ai-engineer",
        experienceLevel: "junior",
      },
    });
  });

  it("restores a saved onboarding step", async () => {
    const userId = "user_restore_step";
    const { profileService } = await loadAuthModules(userId);
    await profileService.updateOnboardingStep(userId, "timeline", {
      targetRole: "ai-engineer",
      experienceLevel: "junior",
    });

    await expect(profileService.getOnboardingState(userId)).resolves.toMatchObject({
      status: "in_progress",
      currentStep: "timeline",
      onboarding: {
        targetRole: "ai-engineer",
        experienceLevel: "junior",
      },
    });
  });

  it("marks onboarding as analyzing before profile completion", async () => {
    const userId = "user_analyzing_service";
    const { profileService } = await loadAuthModules(userId);

    await expect(
      profileService.markOnboardingAnalyzing(userId, onboardingPayload),
    ).resolves.toMatchObject({
      onboardingStatus: "analyzing",
      currentOnboardingStep: "review",
      onboardingCompletedAt: null,
      analysisError: null,
    });
  });

  it("completes onboarding", async () => {
    const userId = "user_complete_service";
    const { profileService } = await loadAuthModules(userId);

    await expect(
      profileService.markOnboardingCompleted(userId, onboardingPayload),
    ).resolves.toMatchObject({
      onboardingStatus: "completed",
      currentOnboardingStep: "review",
      onboardingCompletedAt: expect.any(String),
      analysisError: null,
    });
  });

  it("stores failed analysis state", async () => {
    const userId = "user_failed_analysis";
    const { profileService } = await loadAuthModules(userId);
    await profileService.updateOnboardingStep(userId, "review", onboardingPayload);

    await expect(
      profileService.markOnboardingFailed(userId, "Analysis timed out."),
    ).resolves.toMatchObject({
      onboardingStatus: "failed",
      currentOnboardingStep: "review",
      analysisError: "Analysis timed out.",
    });
  });

  it("isolates onboarding state by Clerk user ID", async () => {
    const { profileService } = await loadAuthModules("user_isolation_a");
    await profileService.updateOnboardingStep("user_isolation_a", "timeline", {
      targetRole: "ai-engineer",
      experienceLevel: "junior",
    });

    await expect(
      profileService.getOnboardingState("user_isolation_b"),
    ).resolves.toMatchObject({
      status: "not_started",
      currentStep: "target-role",
      onboarding: null,
    });
  });

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
