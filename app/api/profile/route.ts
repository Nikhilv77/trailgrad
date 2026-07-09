import { getProfile } from "@/lib/services/profile-service";

export async function GET() {
  try {
    return Response.json(await getProfile());
  } catch {
    return Response.json({ error: "Unable to load profile." }, { status: 500 });
  }
}
