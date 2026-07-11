import { expect, test } from "@playwright/test";

test("landing page routes into onboarding", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Trailgrad home" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /interview-ready before/i })).toBeVisible();
  await expect(page.locator(".tg-ambient-gradient")).toHaveCount(1);

  await page.getByRole("link", { name: /start free analysis/i }).click();

  await expect(page).toHaveURL(/\/onboarding$/);
  await expect(page.getByRole("heading", { name: /where are you headed/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Data Scientist/i })).toHaveCount(0);

  await page.getByRole("button", { name: /View more roles/i }).click();

  await expect(page.getByRole("button", { name: /Data Scientist/i })).toBeVisible();
});

test("onboarding builds a workspace", async ({ page }) => {
  await page.goto("/onboarding");

  await page.getByRole("button", { name: /AI Engineer/i }).click();
  await page.getByRole("button", { name: /Continue/i }).click();
  await page.getByRole("button", { name: /0-2 years/i }).click();
  await page.getByRole("button", { name: /Continue/i }).click();
  await page.getByRole("button", { name: /Applying this month/i }).click();
  await page.getByRole("button", { name: /Continue/i }).click();

  await expect(page.getByRole("heading", { name: /add your resume/i })).toBeVisible();
  await page.getByRole("button", { name: /Skip for now/i }).click();
  await expect(page.getByRole("heading", { name: /paste the target job/i })).toBeVisible();
  await page.getByRole("button", { name: /Skip for now/i }).click();
  await expect(page.getByRole("heading", { name: /add github/i })).toBeVisible();
  await page.getByRole("button", { name: /Skip for now/i }).click();
  await expect(page.getByRole("heading", { name: /add linkedin/i })).toBeVisible();
  await page.getByRole("button", { name: /Skip for now/i }).click();
  await expect(page.getByRole("heading", { name: /ready to build your workspace/i })).toBeVisible();

  await page.getByRole("button", { name: /Create account to save/i }).click();
  await expect(page).toHaveURL(/\/auth$/, { timeout: 5_000 });
  await expect(page.getByRole("heading", { name: /continue building your interview readiness/i })).toBeVisible();
});

test("auth page shows the Clerk auth card", async ({ page }) => {
  await page.goto("/auth");

  await expect(page.getByRole("link", { name: "Trailgrad home" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /continue building your interview readiness/i })).toBeVisible();
  await expect(page.getByTestId("clerk-auth-surface")).toBeVisible();
});

test("auth ready screen opens the dashboard", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/auth/ready");

  await expect(page.getByRole("heading", { name: /getting things ready/i })).toBeVisible();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 4_000 });
});
