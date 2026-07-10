import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/health/route";

describe("/api/health route", () => {
  it("returns an uncached ok status for uptime checks", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body).toEqual({
      status: "ok",
      service: "trailgrad",
      timestamp: expect.any(String),
    });
  });
});
