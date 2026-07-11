import { auth } from "@clerk/nextjs/server";
import { ZodError } from "zod";

import { completeTrailgradOnboarding } from "@/lib/services/profile-service";
import { OnboardingSubmissionSchema } from "@/lib/validators/profile";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const input = OnboardingSubmissionSchema.parse(await request.json());
    const profile = await completeTrailgradOnboarding(userId, input);

    return Response.json({
      onboardingCompletedAt: profile.onboardingCompletedAt,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "Invalid onboarding payload." },
        { status: 400 },
      );
    }

    return Response.json(
      { error: "Unable to save onboarding." },
      { status: 500 },
    );
  }
}
