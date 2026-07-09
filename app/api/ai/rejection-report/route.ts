import { getRejectionReport } from "@/lib/services/report-service";

export async function GET() {
  try {
    return Response.json(await getRejectionReport());
  } catch {
    return Response.json({ error: "Unable to load rejection report." }, { status: 500 });
  }
}
