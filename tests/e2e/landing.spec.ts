import { expect, test } from "@playwright/test";

test("landing page routes into auth", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Trailgrad home" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /interview-ready before/i })).toBeVisible();
  await expect(page.locator(".tg-ambient-gradient")).toHaveCount(1);

  await page.getByRole("link", { name: /start free analysis/i }).click();

  await expect(page).toHaveURL(/\/auth$/);
  await expect(page.getByTestId("clerk-auth-surface")).toBeVisible();
});

test("signed-out onboarding asks for auth", async ({ page }) => {
  await page.goto("/onboarding");

  await expect(page).toHaveURL(/\/auth\?redirect_url=.*%2Fonboarding$/);
  await expect(page.getByTestId("clerk-auth-surface")).toBeVisible();
});

test("signed-out app route asks for auth", async ({ page }) => {
  await page.goto("/today");

  await expect(page).toHaveURL(/\/auth\?redirect_url=.*%2Ftoday$/);
  await expect(page.getByTestId("clerk-auth-surface")).toBeVisible();
});

test("auth page shows the Clerk auth card", async ({ page }) => {
  await page.goto("/auth");

  await expect(page.getByRole("link", { name: "Trailgrad home" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /continue building your interview readiness/i })).toBeVisible();
  await expect(page.getByTestId("clerk-auth-surface")).toBeVisible();
});

test("auth ready redirects signed-out users to auth", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/auth/ready");

  await expect(page).toHaveURL(/\/auth$/, { timeout: 4_000 });
  await expect(page.getByTestId("clerk-auth-surface")).toBeVisible();
});
