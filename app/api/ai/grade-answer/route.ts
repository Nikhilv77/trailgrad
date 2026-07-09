import { gradeAnswer } from "@/lib/services/interview-service";
import { GradeAnswerRequestSchema } from "@/lib/validators/interview";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const input = GradeAnswerRequestSchema.parse(await request.json());
    return Response.json(await gradeAnswer(input));
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ error: error.issues[0]?.message ?? "Invalid answer request." }, { status: 400 });
    }
    return Response.json({ error: "Unable to grade answer." }, { status: 500 });
  }
}
