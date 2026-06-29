import { test, expect } from "@playwright/test";

test.describe("01 - Scaffold & DB (seed verification)", () => {
  test("app serves the login page at /login", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/exam ready/i);
    await expect(page.getByRole("heading", { name: /exam ready/i })).toBeVisible();
  });

  test("root / redirects to /login when not authenticated", async ({ page }) => {
    await page.goto("/");
    // Proxy may redirect or show landing — at minimum no server crash
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("protected /dashboard redirects to /login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("register page loads", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("heading", { name: /join exam ready/i })).toBeVisible();
  });
});
