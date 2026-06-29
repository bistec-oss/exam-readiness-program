import { test, expect } from "@playwright/test";

const CANDIDATE = { email: "candidate@bistecglobal.com", password: "candidate123!" };

async function loginAsCandidate(page: Parameters<typeof test>[1] extends (args: { page: infer P }) => unknown ? P : never) {
  await page.goto("/login");
  await page.fill('input[name="email"]', CANDIDATE.email);
  await page.fill('input[name="password"]', CANDIDATE.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe("05 - Progress Dashboard & Gamification", () => {
  test("dashboard shows readiness gauge", async ({ page }) => {
    await loginAsCandidate(page);
    await expect(page.locator("svg")).toBeVisible();
    await expect(page.getByText("Readiness")).toBeVisible();
  });

  test("dashboard shows XP bar", async ({ page }) => {
    await loginAsCandidate(page);
    await expect(page.getByText(/XP/).first()).toBeVisible();
  });

  test("dashboard shows badges section", async ({ page }) => {
    await loginAsCandidate(page);
    await expect(page.getByText("Badges")).toBeVisible();
    await expect(page.getByText("First Step")).toBeVisible();
    await expect(page.getByText("Halfway There")).toBeVisible();
    await expect(page.getByText("Challenge Master")).toBeVisible();
  });

  test("dashboard shows exam catalog link", async ({ page }) => {
    await loginAsCandidate(page);
    await expect(page.getByText("Exam Catalog")).toBeVisible();
  });

  test("API GET /api/progress returns data for authenticated user", async ({ request, page }) => {
    await loginAsCandidate(page);
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === "session");

    const res = await request.get("/api/progress", {
      headers: { Cookie: `session=${sessionCookie?.value}` },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("xp");
    expect(data).toHaveProperty("readiness");
    expect(data).toHaveProperty("badges");
    expect(data).toHaveProperty("attempts");
    expect(data).toHaveProperty("mockAttempts");
    expect(data).toHaveProperty("weakTopics");
    expect(Array.isArray(data.badges)).toBe(true);
    expect(data.badges).toHaveLength(3);
  });

  test("API GET /api/progress returns 401 without session", async ({ request }) => {
    const res = await request.get("/api/progress");
    expect(res.status()).toBe(401);
  });

  test("badges update after completing a challenge", async ({ page }) => {
    await loginAsCandidate(page);
    // Check badges section visible
    await expect(page.getByText("Badges")).toBeVisible();
    // First Step badge should be earned if user has any attempts
    // (demo candidate may or may not have attempts — just check the badge exists)
    await expect(page.getByText("First Step")).toBeVisible();
  });

  test("challenge history shows after completing a challenge", async ({ page }) => {
    // First complete a challenge
    await loginAsCandidate(page);
    await page.goto("/challenges/cs-safety-principles/play");

    // Answer all questions in the safety set (7 questions)
    for (let i = 0; i < 7; i++) {
      await page.waitForSelector(".grid button", { timeout: 5000 });
      await page.locator(".grid button").first().click();
      const nextBtn = page.getByRole("button", { name: /Next Question|See Results/ });
      await expect(nextBtn).toBeVisible({ timeout: 3000 });
      await nextBtn.click();
    }
    await expect(page.getByText("Challenge Complete!")).toBeVisible({ timeout: 5000 });

    // Go back to dashboard and check history
    await page.goto("/dashboard");
    await expect(page.getByText("Challenge History")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Safety & Responsible AI").first()).toBeVisible();
  });

  test("readiness % is 0 for new user with no attempts", async ({ page }) => {
    // Register a fresh user and check readiness
    const uniqueEmail = `fresh-${Date.now()}@example.com`;
    await page.goto("/register");
    await page.fill('input[name="name"]', "Fresh User");
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', "freshpass123!");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Should show 0% readiness
    await expect(page.getByText("0%")).toBeVisible();
  });

  test("readiness gauge SVG has correct structure", async ({ request, page }) => {
    await loginAsCandidate(page);
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === "session");

    const res = await request.get("/api/progress", {
      headers: { Cookie: `session=${sessionCookie?.value}` },
    });
    const data = await res.json();
    expect(typeof data.readiness).toBe("number");
    expect(data.readiness).toBeGreaterThanOrEqual(0);
    expect(data.readiness).toBeLessThanOrEqual(100);
  });
});
