import { analyzeResume } from "@/lib/services/resume-service";
import { ResumeAnalyzeRequestSchema } from "@/lib/validators/resume";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const input = ResumeAnalyzeRequestSchema.parse(await request.json());
    return Response.json(await analyzeResume(input));
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ error: error.issues[0]?.message ?? "Invalid resume request." }, { status: 400 });
    }
    return Response.json({ error: "Unable to analyze resume." }, { status: 500 });
  }
}
