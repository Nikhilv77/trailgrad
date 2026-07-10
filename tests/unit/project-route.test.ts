import { describe, expect, it } from "vitest";

import { GET, POST } from "@/app/api/projects/route";

describe("/api/projects route", () => {
  it("returns projects", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.length).toBeGreaterThan(0);
  });

  it("creates a project for valid input", async () => {
    const response = await POST(
      new Request("http://localhost/api/projects", {
        method: "POST",
        body: JSON.stringify({
          name: "Realtime Interview Board",
          summary: "Tracks practice progress and follow-up risk signals.",
          techStack: ["Next.js", "Postgres"],
        }),
      }),
    );

    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toMatchObject({
      id: "realtime-interview-board",
      name: "Realtime Interview Board",
    });
  });

  it("rejects invalid project payloads", async () => {
    const response = await POST(
      new Request("http://localhost/api/projects", {
        method: "POST",
        body: JSON.stringify({
          name: "A",
          summary: "short",
          techStack: [],
        }),
      }),
    );

    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toEqual(expect.any(String));
  });
});
