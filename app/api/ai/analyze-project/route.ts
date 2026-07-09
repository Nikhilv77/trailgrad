import { analyzeProject } from "@/lib/services/project-service";
import { AnalyzeProjectRequestSchema } from "@/lib/validators/project";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const input = AnalyzeProjectRequestSchema.parse(await request.json());
    return Response.json(await analyzeProject(input));
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ error: error.issues[0]?.message ?? "Invalid project request." }, { status: 400 });
    }
    return Response.json({ error: "Unable to analyze project." }, { status: 500 });
  }
}
