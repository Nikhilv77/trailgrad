import { createProject, getProjects } from "@/lib/services/project-service";
import { z, ZodError } from "zod";

const CreateProjectSchema = z.object({
  name: z.string().min(2),
  summary: z.string().min(10),
  techStack: z.array(z.string()).min(1),
});

export async function GET() {
  try {
    return Response.json(await getProjects());
  } catch {
    return Response.json({ error: "Unable to load projects." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const input = CreateProjectSchema.parse(await request.json());
    return Response.json(await createProject(input), { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ error: error.issues[0]?.message ?? "Invalid project payload." }, { status: 400 });
    }
    return Response.json({ error: "Unable to create project." }, { status: 500 });
  }
}
