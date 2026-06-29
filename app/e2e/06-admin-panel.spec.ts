import { test, expect } from "@playwright/test";

const ADMIN = { email: "admin@bistecglobal.com", password: "admin123!" };
const CANDIDATE = { email: "candidate@bistecglobal.com", password: "candidate123!" };

async function loginAs(page: Parameters<typeof test>[1] extends (args: { page: infer P }) => unknown ? P : never, user: typeof ADMIN) {
  await page.goto("/login");
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe("06 - Admin Panel", () => {
  test("admin dashboard shows Admin Panel link", async ({ page }) => {
    await loginAs(page, ADMIN);
    await expect(page.getByText("Admin Panel")).toBeVisible();
  });

  test("candidate cannot access /admin — redirected to dashboard", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("unauthenticated user redirected from /admin to /login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("admin can access /admin overview", async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Admin Overview" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Admin Overview" })).toBeVisible();
    await expect(page.locator("main")).toContainText("Exams");
    await expect(page.locator("main")).toContainText("Questions");
  });

  test("admin sidebar shows navigation links", async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto("/admin");
    // Sidebar nav links (in the aside)
    await expect(page.locator("aside a:has-text('Exams')")).toBeVisible();
    await expect(page.locator("aside a:has-text('Challenges')")).toBeVisible();
    await expect(page.locator("aside a:has-text('Questions')")).toBeVisible();
  });

  test("admin exams page loads with existing exam", async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto("/admin/exams");
    await expect(page.getByRole("heading", { name: "Exams" })).toBeVisible();
    await expect(page.getByText("Claude Architect Certification")).toBeVisible();
    await expect(page.getByText("Create New Exam")).toBeVisible();
  });

  test("admin can create a new exam", async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto("/admin/exams");
    await page.fill('input[name="name"]', "Test Exam E2E");
    await page.fill('textarea[name="description"]', "Created by e2e test");
    await page.fill('input[name="passingScore"]', "75");
    await page.fill('input[name="durationMinutes"]', "60");
    await page.click('button[type="submit"]:has-text("Create Exam")');
    await expect(page).toHaveURL(/\/admin\/exams/);
    await expect(page.getByText("Test Exam E2E")).toBeVisible({ timeout: 5000 });
  });

  test("admin can edit an exam", async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto("/admin/exams");
    await page.locator("a:has-text('Edit')").first().click();
    await expect(page).toHaveURL(/\/admin\/exams\/.*\/edit/);
    await expect(page.getByRole("heading", { name: "Edit Exam" })).toBeVisible();
    await page.fill('input[name="durationMinutes"]', "95");
    await page.click('button:has-text("Save Changes")');
    await expect(page).toHaveURL(/\/admin\/exams/);
  });

  test("admin challenges page loads", async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto("/admin/challenges");
    await expect(page.getByRole("heading", { name: "Challenge Sets" })).toBeVisible();
    await expect(page.getByText("Safety & Responsible AI")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Create Challenge Set" })).toBeVisible();
  });

  test("admin can create a new challenge set", async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto("/admin/challenges");
    await page.fill('input[name="title"]', "E2E Test Challenge");
    await page.fill('input[name="topic"]', "Testing");
    await page.fill('input[name="xpReward"]', "30");
    await page.selectOption('select[name="examId"]', { index: 1 });
    await page.click('button:has-text("Create Challenge Set")');
    await expect(page).toHaveURL(/\/admin\/challenges/);
    await expect(page.getByText("E2E Test Challenge").first()).toBeVisible({ timeout: 5000 });
  });

  test("admin questions page loads with existing questions", async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto("/admin/questions");
    await expect(page.getByRole("heading", { name: "Questions" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Add Question" })).toBeVisible();
    await expect(page.locator("table tbody tr").first()).toBeVisible();
  });

  test("admin can create a TRUE_FALSE question", async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto("/admin/questions");
    await page.fill('textarea[name="text"]', "E2E Test: Is this a test question?");
    await page.selectOption('select[name="type"]', "TRUE_FALSE");
    await page.fill('input[name="correctOptionId"]', "true");
    await page.fill('textarea[name="explanation"]', "Yes, this is a test question created by e2e.");
    await page.selectOption('select[name="examId"]', { index: 1 });
    await page.click('button:has-text("Add Question")');
    await expect(page).toHaveURL(/\/admin\/questions/);
    await expect(page.getByText("E2E Test: Is this a test question?").first()).toBeVisible({ timeout: 5000 });
  });

  test("API GET /api/admin/exams returns 403 for candidate", async ({ request, page }) => {
    await loginAs(page, CANDIDATE);
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === "session");

    const res = await request.get("/api/admin/exams", {
      headers: { Cookie: `session=${sessionCookie?.value}` },
    });
    expect(res.status()).toBe(403);
  });

  test("API GET /api/admin/exams returns exam list for admin", async ({ request, page }) => {
    await loginAs(page, ADMIN);
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === "session");

    const res = await request.get("/api/admin/exams", {
      headers: { Cookie: `session=${sessionCookie?.value}` },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  test("API GET /api/admin/questions returns question list for admin", async ({ request, page }) => {
    await loginAs(page, ADMIN);
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === "session");

    const res = await request.get("/api/admin/questions", {
      headers: { Cookie: `session=${sessionCookie?.value}` },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });
});
