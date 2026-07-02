import { test, expect } from "@playwright/test";

const CANDIDATE = { email: "candidate@bistecglobal.com", password: "candidate123!" };
const PLAN_ID = "sp-claude-architect";
const FIRST_SET_ID = "cs-customer-support-agent";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.fill('input[name="email"]', CANDIDATE.email);
  await page.fill('input[name="password"]', CANDIDATE.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe("19 - Study Plans", () => {
  test("dashboard links to study plans", async ({ page }) => {
    await login(page);
    await page.click('a[href="/study-plans"]');
    await expect(page).toHaveURL(/\/study-plans/);
    await expect(page.getByRole("heading", { name: /study plans/i })).toBeVisible();
  });

  test("candidate can enroll and see the plan timeline", async ({ page }) => {
    await login(page);
    await page.goto(`/study-plans/${PLAN_ID}`);
    await expect(page.getByRole("heading", { name: /readiness path/i })).toBeVisible();

    // Enroll if not already enrolled.
    const start = page.getByRole("button", { name: /start this plan/i });
    if (await start.isVisible().catch(() => false)) {
      await start.click();
      await expect(page).toHaveURL(new RegExp(`/study-plans/${PLAN_ID}`));
    }

    // Timeline shows the first step and a progress indicator.
    await expect(page.getByText("Customer Support Resolution Agent")).toBeVisible();
    await expect(page.getByText(/steps complete/i)).toBeVisible();
  });

  test("completing a challenge set flips its step to complete", async ({ page }) => {
    await login(page);

    // Ensure enrolled.
    await page.request.post(`/api/study-plans/${PLAN_ID}/enroll`);

    // Record a passing attempt on the first step's challenge set (100%).
    const res = await page.request.post("/api/attempts", {
      data: {
        challengeSetId: FIRST_SET_ID,
        answers: {},
        score: 5,
        total: 5,
        xpEarned: 50,
        idempotencyKey: `e2e-studyplan-${FIRST_SET_ID}`,
      },
    });
    expect(res.ok()).toBeTruthy();

    // Progress API reflects the completed first step.
    const progress = await (await page.request.get(`/api/study-plans/${PLAN_ID}/progress`)).json();
    const firstStep = progress.steps.find(
      (s: { challengeSetId: string | null }) => s.challengeSetId === FIRST_SET_ID
    );
    expect(firstStep.completed).toBe(true);
    expect(progress.completedCount).toBeGreaterThanOrEqual(1);

    // Detail page renders a "Review" action for the completed step.
    await page.goto(`/study-plans/${PLAN_ID}`);
    await expect(page.getByRole("link", { name: /review/i }).first()).toBeVisible();
  });
});
