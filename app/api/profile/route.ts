import { auth, currentUser } from "@clerk/nextjs/server";
import { ZodError } from "zod";

import {
  getOnboardingState,
  getOrCreateTrailgradProfile,
  toUserProfile,
  updateOnboardingStep,
  updateProfileDefaults,
} from "@/lib/services/profile-service";
import {
  OnboardingSubmissionSchema,
  ProfileSettingsUpdateSchema,
} from "@/lib/validators/profile";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const [clerkUser, profile] = await Promise.all([
      currentUser(),
      getOrCreateTrailgradProfile(userId),
    ]);
    const name = [clerkUser?.firstName, clerkUser?.lastName]
      .filter(Boolean)
      .join(" ");
    const email = clerkUser?.emailAddresses.find(
      (emailAddress) => emailAddress.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress;

    return Response.json(
      toUserProfile(userId, profile, {
        name,
        email,
      }),
    );
  } catch {
    return Response.json({ error: "Unable to load profile." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const input = ProfileSettingsUpdateSchema.parse(await request.json());
    const state = await getOnboardingState(userId);

    if (state.status !== "completed") {
      return Response.json(
        { error: "Complete onboarding before updating profile settings." },
        { status: 409 },
      );
    }

    const onboarding = OnboardingSubmissionSchema.parse({
      ...(state.onboarding ?? {}),
      targetRole: input.targetRole,
      experienceLevel: input.experienceLevel,
    });

    const [profile, careerContext] = await Promise.all([
      updateOnboardingStep(userId, "review", onboarding),
      updateProfileDefaults(userId, input),
    ]);

    return Response.json({
      careerContext,
      onboarding: profile.onboarding,
      status: "updated",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: error.issues[0]?.message ?? "Invalid profile update.",
        },
        { status: 400 },
      );
    }

    return Response.json(
      { error: "Unable to update profile." },
      { status: 500 },
    );
  }
}
