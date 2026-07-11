import { auth, currentUser } from "@clerk/nextjs/server";

import {
  getOrCreateTrailgradProfile,
  toUserProfile,
} from "@/lib/services/profile-service";

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
