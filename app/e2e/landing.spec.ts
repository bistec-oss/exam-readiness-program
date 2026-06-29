import { test, expect } from "@playwright/test";

test.describe("14 - Landing Page — Public Catalog", () => {
  test("anonymous visitor sees exam catalog at /", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Exam Ready/);
    await expect(page.getByRole("heading", { name: /Exam Catalog/ })).toBeVisible();
    const cards = page.locator("[data-testid='exam-card']");
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("/ shows Sign in + Register CTAs for anonymous", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /^Sign in$/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Register$/ })).toBeVisible();
  });

  test("logged-in user sees Dashboard link instead of Sign in", async ({ page }) => {
    // Pre-seeded from app/prisma/seed.ts: candidate@bistecglobal.com / candidate123!
    await page.goto("/login");
    await page.fill('input[name="email"]', "candidate@bistecglobal.com");
    await page.fill('input[name="password"]', "candidate123!");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
    await page.goto("/");
    // Logged-in header: "← Dashboard" link visible, Sign in link gone
    await expect(page.getByRole("link", { name: /Dashboard/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Sign in$/ })).toHaveCount(0);
  });
});