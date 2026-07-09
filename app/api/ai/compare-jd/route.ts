import { compareJD } from "@/lib/services/jd-service";
import { JDMatchRequestSchema } from "@/lib/validators/jd";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const input = JDMatchRequestSchema.parse(await request.json());
    return Response.json(await compareJD(input));
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ error: error.issues[0]?.message ?? "Invalid JD match request." }, { status: 400 });
    }
    return Response.json({ error: "Unable to compare JD." }, { status: 500 });
  }
}
