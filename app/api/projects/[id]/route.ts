import { getProject } from "@/lib/services/project-service";

export async function GET(_request: Request, context: RouteContext<"/api/projects/[id]">) {
  try {
    const { id } = await context.params;
    return Response.json(await getProject(id));
  } catch {
    return Response.json({ error: "Unable to load project." }, { status: 500 });
  }
}
