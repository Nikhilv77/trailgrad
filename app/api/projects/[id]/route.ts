import { getProject } from "@/lib/services/project-service";

interface ProjectRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: Request, context: ProjectRouteContext) {
  try {
    const { id } = await context.params;
    return Response.json(await getProject(id));
  } catch {
    return Response.json({ error: "Unable to load project." }, { status: 500 });
  }
}
