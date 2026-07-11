import { auth } from "@clerk/nextjs/server";
import { ZodError } from "zod";

import {
  getOnboardingState,
  markOnboardingAnalyzing,
  markOnboardingFailed,
  updateOnboardingStep,
} from "@/lib/services/profile-service";
import {
  OnboardingStepUpdateSchema,
  OnboardingSubmissionSchema,
} from "@/lib/validators/profile";

async function requireUserId() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  return userId;
}

export async function GET() {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return Response.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    return Response.json(await getOnboardingState(userId));
  } catch {
    return Response.json(
      { error: "Unable to load onboarding state." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return Response.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const input = OnboardingStepUpdateSchema.parse(await request.json());
    const profile = await updateOnboardingStep(
      userId,
      input.currentStep,
      input.onboarding,
    );

    return Response.json({
      status: profile.onboardingStatus,
      currentStep: profile.currentOnboardingStep,
      startedAt: profile.onboardingStartedAt,
      completedAt: profile.onboardingCompletedAt,
      analysisError: profile.analysisError,
      onboarding: profile.onboarding,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "Invalid onboarding payload." },
        { status: 400 },
      );
    }

    return Response.json(
      { error: "Unable to save onboarding step." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let userId: string | null = null;

  try {
    userId = await requireUserId();

    if (!userId) {
      return Response.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const input = OnboardingSubmissionSchema.parse(await request.json());
    const profile = await markOnboardingAnalyzing(userId, input);

    return Response.json({
      status: profile.onboardingStatus,
      currentStep: profile.currentOnboardingStep,
      startedAt: profile.onboardingStartedAt,
      completedAt: profile.onboardingCompletedAt,
      analysisError: profile.analysisError,
      onboarding: profile.onboarding,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "Invalid onboarding payload." },
        { status: 400 },
      );
    }

    if (userId) {
      await markOnboardingFailed(
        userId,
        error instanceof Error ? error.message : "Unable to save onboarding.",
      ).catch(() => undefined);
    }

    return Response.json(
      { error: "Unable to save onboarding." },
      { status: 500 },
    );
  }
}
