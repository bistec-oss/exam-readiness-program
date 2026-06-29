import { test, expect } from "@playwright/test";

const ADMIN = { email: "admin@bistecglobal.com", password: "admin123!" };
const CANDIDATE = { email: "candidate@bistecglobal.com", password: "candidate123!" };

test.describe("02 - Auth & Role-Based Access", () => {
  test("candidate can log in and reaches dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', CANDIDATE.email);
    await page.fill('input[name="password"]', CANDIDATE.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText("Demo Candidate")).toBeVisible();
  });

  test("admin can log in and sees admin indicator", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', ADMIN.email);
    await page.fill('input[name="password"]', ADMIN.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText("ADMIN", { exact: true }).first()).toBeVisible();
  });

  test("wrong password shows error", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', CANDIDATE.email);
    await page.fill('input[name="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });

  test("login trims surrounding whitespace on email", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', `   ${CANDIDATE.email}   `);
    await page.fill('input[name="password"]', CANDIDATE.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("new user can register and is redirected to dashboard", async ({ page }) => {
    const uniqueEmail = `test-${Date.now()}@example.com`;
    await page.goto("/register");
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', "testpass123!");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText("Test User")).toBeVisible();
  });

  test("duplicate email shows error on register", async ({ page }) => {
    await page.goto("/register");
    await page.fill('input[name="name"]', "Dup User");
    await page.fill('input[name="email"]', CANDIDATE.email);
    await page.fill('input[name="password"]', "somepass123!");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByText(/email already in use/i)).toBeVisible();
  });

  test("authenticated user can sign out", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', CANDIDATE.email);
    await page.fill('input[name="password"]', CANDIDATE.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.click('button[type="submit"]'); // sign out button
    await expect(page).toHaveURL(/\/login/);
  });

  test("candidate cannot access /admin — redirected to dashboard", async ({ page }) => {
    // Log in as candidate first
    await page.goto("/login");
    await page.fill('input[name="email"]', CANDIDATE.email);
    await page.fill('input[name="password"]', CANDIDATE.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Try to access admin
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
