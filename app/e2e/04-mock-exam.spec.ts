import { test, expect } from "@playwright/test";

const CANDIDATE = { email: "candidate@bistecglobal.com", password: "candidate123!" };

async function loginAsCandidate(page: Parameters<typeof test>[1] extends (args: { page: infer P }) => unknown ? P : never) {
  await page.goto("/login");
  await page.fill('input[name="email"]', CANDIDATE.email);
  await page.fill('input[name="password"]', CANDIDATE.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe("04 - Timed Mock Exam Mode", () => {
  test("mock exam intro page loads", async ({ page }) => {
    await loginAsCandidate(page);
    await page.goto("/mock-exam/claude-architect-v1");
    await expect(page.getByText("Claude Architect Certification")).toBeVisible();
    await expect(page.getByText("Full Mock Exam")).toBeVisible();
    await expect(page.getByText(/Duration/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Start Exam" })).toBeVisible();
  });

  test("unauthenticated user redirected from mock exam to login", async ({ page }) => {
    await page.goto("/mock-exam/claude-architect-v1");
    await expect(page).toHaveURL(/\/login/);
  });

  test("exam page links to mock exam", async ({ page }) => {
    await loginAsCandidate(page);
    await page.goto("/exams/claude-architect-v1");
    await expect(page.getByText("Full Mock Exam")).toBeVisible();
    await page.click("text=Full Mock Exam");
    await expect(page).toHaveURL(/\/mock-exam\/claude-architect-v1/);
  });

  test("starting mock exam shows questions and timer", async ({ page }) => {
    await loginAsCandidate(page);
    await page.goto("/mock-exam/claude-architect-v1");
    await page.click('button:has-text("Start Exam")');

    // Timer should appear
    await expect(page.getByText(/\d{2}:\d{2}/)).toBeVisible({ timeout: 5000 });
    // Questions should load
    await expect(page.getByText(/Q 1 \//)).toBeVisible();
  });

  test("can answer questions and navigate in mock exam", async ({ page }) => {
    await loginAsCandidate(page);
    await page.goto("/mock-exam/claude-architect-v1");
    await page.click('button:has-text("Start Exam")');
    await expect(page.getByText(/Q 1 \//)).toBeVisible({ timeout: 5000 });

    // Answer first question (pick any option)
    const firstOption = page.locator(".grid button").first();
    await firstOption.click();
    await expect(page.getByText("Answered: 1/")).toBeVisible();

    // Navigate to next
    await page.click('button:has-text("Next")');
    await expect(page.getByText(/Q 2 \//)).toBeVisible();

    // Navigate back
    await page.click('button:has-text("Previous")');
    await expect(page.getByText(/Q 1 \//)).toBeVisible();
  });

  test("submitting mock exam redirects to review page", async ({ page }) => {
    await loginAsCandidate(page);
    await page.goto("/mock-exam/claude-architect-v1");
    await page.click('button:has-text("Start Exam")');
    await expect(page.getByText(/Q 1 \//)).toBeVisible({ timeout: 5000 });

    const totalText = await page.locator("text=/Q 1 \\/ \\d+/").textContent();
    const total = totalText ? parseInt(totalText.split("/")[1].trim()) : 20;

    // Answer every question with the first option, then submit
    for (let i = 0; i < total; i++) {
      await expect(page.getByText(`Q ${i + 1} /`)).toBeVisible({ timeout: 5000 });
      const firstOption = page.locator(".grid button").first();
      if (await firstOption.isVisible()) await firstOption.click();

      if (i < total - 1) {
        await page.click('button:has-text("Next")');
      }
    }

    // Submit
    await page.click('button:has-text("Submit Exam")');
    await expect(page).toHaveURL(/\/mock-exam\/.*\/review\//, { timeout: 10000 });
  });

  test("review page shows score and all questions", async ({ page }) => {
    await loginAsCandidate(page);
    await page.goto("/mock-exam/claude-architect-v1");
    await page.click('button:has-text("Start Exam")');
    await expect(page.getByText(/Q 1 \//)).toBeVisible({ timeout: 5000 });

    const totalText = await page.locator("text=/Q 1 \\/ \\d+/").textContent();
    const total = totalText ? parseInt(totalText.split("/")[1].trim()) : 20;

    for (let i = 0; i < total; i++) {
      await expect(page.getByText(`Q ${i + 1} /`)).toBeVisible({ timeout: 5000 });
      const firstOption = page.locator(".grid button").first();
      if (await firstOption.isVisible()) await firstOption.click();
      if (i < total - 1) await page.click('button:has-text("Next")');
    }

    await page.click('button:has-text("Submit Exam")');
    await expect(page).toHaveURL(/\/mock-exam\/.*\/review\//, { timeout: 10000 });

    // Review page content
    await expect(page.getByText("Mock Exam Review")).toBeVisible();
    await expect(page.getByText(/Score|Correct|Time Used/).first()).toBeVisible();
    await expect(page.getByText("Question Review")).toBeVisible();
  });

  test("API POST /api/mock-exams/start returns questions", async ({ request, page }) => {
    await loginAsCandidate(page);
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === "session");

    const res = await request.post("/api/mock-exams/start", {
      data: { examId: "claude-architect-v1" },
      headers: { Cookie: `session=${sessionCookie?.value}` },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("startedAt");
    expect(data).toHaveProperty("durationMinutes");
    expect(Array.isArray(data.questions)).toBe(true);
    expect(data.questions.length).toBeGreaterThan(0);
    // Questions should NOT include correctOptionId (security: not exposed during exam)
    expect(data.questions[0]).not.toHaveProperty("correctOptionId");
  });

  test("API POST /api/mock-exams/start returns 401 without session", async ({ request }) => {
    const res = await request.post("/api/mock-exams/start", {
      data: { examId: "claude-architect-v1" },
    });
    expect(res.status()).toBe(401);
  });
});
