import { getPracticePlan, getProgress } from "@/lib/services/practice-service";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    if (url.searchParams.get("view") === "progress") {
      return Response.json(await getProgress());
    }
    return Response.json(await getPracticePlan());
  } catch {
    return Response.json({ error: "Unable to load practice plan." }, { status: 500 });
  }
}
