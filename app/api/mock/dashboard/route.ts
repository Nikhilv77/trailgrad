import { getDashboard } from "@/lib/services/profile-service";

export async function GET() {
  try {
    return Response.json(await getDashboard());
  } catch {
    return Response.json({ error: "Unable to load dashboard." }, { status: 500 });
  }
}
