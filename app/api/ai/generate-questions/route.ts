import { generateQuestions } from "@/lib/services/interview-service";
import { GenerateQuestionsRequestSchema } from "@/lib/validators/interview";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const input = GenerateQuestionsRequestSchema.parse(await request.json());
    return Response.json(await generateQuestions(input));
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ error: error.issues[0]?.message ?? "Invalid question request." }, { status: 400 });
    }
    return Response.json({ error: "Unable to generate questions." }, { status: 500 });
  }
}
