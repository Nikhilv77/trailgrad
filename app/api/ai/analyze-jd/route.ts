import { analyzeJD } from "@/lib/services/jd-service";
import { JDAnalyzeRequestSchema } from "@/lib/validators/jd";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const input = JDAnalyzeRequestSchema.parse(await request.json());
    return Response.json(await analyzeJD(input));
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ error: error.issues[0]?.message ?? "Invalid JD request." }, { status: 400 });
    }
    return Response.json({ error: "Unable to analyze job description." }, { status: 500 });
  }
}
