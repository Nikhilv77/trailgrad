import { expect, test } from "@playwright/test";

test("landing page routes into onboarding", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "TrailGrad home" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /interview-ready before/i })).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(1);

  await page.getByRole("link", { name: /start free analysis/i }).click();

  await expect(page).toHaveURL(/\/onboarding$/);
  await expect(page.getByRole("heading", { name: /where are you headed/i })).toBeVisible();
});

test("onboarding builds a workspace", async ({ page }) => {
  await page.goto("/onboarding");

  await page.getByRole("button", { name: /AI Engineer/i }).click();
  await page.getByRole("button", { name: /Continue/i }).click();
  await page.getByRole("button", { name: /0–2 years/i }).click();
  await page.getByRole("button", { name: /Continue/i }).click();
  await page.getByRole("button", { name: /Applying this month/i }).click();
  await page.getByRole("button", { name: /Continue/i }).click();

  await expect(page.getByRole("heading", { name: /add your career context/i })).toBeVisible();
  await page.getByRole("button", { name: /Build my workspace/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 5_000 });
  await expect(page.getByRole("heading", { name: /good morning, arjun/i })).toBeVisible();
});

test("login opens the workspace", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Work email").fill("arjun@example.com");
  await page.getByLabel("Password", { exact: true }).fill("trailgrad-demo");
  await page.getByRole("button", { name: /Continue to workspace/i }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: /good morning, arjun/i })).toBeVisible();
});
