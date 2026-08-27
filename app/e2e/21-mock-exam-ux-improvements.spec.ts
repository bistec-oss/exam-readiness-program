import { test, expect } from "@playwright/test";

const CANDIDATE = { email: "candidate@bistecglobal.com", password: "candidate123!" };

async function loginAsCandidate(page: Parameters<typeof test>[1] extends (args: { page: infer P }) => unknown ? P : never) {
  await page.goto("/login");
  await page.fill('input[name="email"]', CANDIDATE.email);
  await page.fill('input[name="password"]', CANDIDATE.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe("21 - Mock Exam UX Improvements", () => {
  test("API POST /api/mock-exams/start returns at most 60 questions", async ({ request, page }) => {
    await loginAsCandidate(page);
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === "session");

    const res = await request.post("/api/mock-exams/start", {
      data: { examId: "claude-architect-v1" },
      headers: { Cookie: `session=${sessionCookie?.value}` },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.questions)).toBe(true);
    expect(data.questions.length).toBeLessThanOrEqual(60);
    expect(data.questions.length).toBeGreaterThan(0);
  });

  test("per-question timer is visible and starts near 00:00", async ({ page }) => {
    await loginAsCandidate(page);
    await page.goto("/mock-exam/claude-architect-v1");
    await page.click('button:has-text("Start Exam")');
    await expect(page.getByText(/Q 1 \//)).toBeVisible({ timeout: 5000 });

    // The per-question timer shows the hourglass emoji prefix.
    const questionTimer = page.getByText(/⏳ \d{2}:\d{2}/);
    await expect(questionTimer).toBeVisible();
    await expect(questionTimer).toHaveText(/⏳ 00:0\d/);

    // The overall exam timer is still present (distinct, stopwatch emoji prefix).
    await expect(page.getByText(/⏱ \d{2}:\d{2}/)).toBeVisible();
  });

  test("per-question timer resets when navigating to a new question", async ({ page }) => {
    await page.goto("/login");
    await page.clock.install();
    await page.fill('input[name="email"]', CANDIDATE.email);
    await page.fill('input[name="password"]', CANDIDATE.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/mock-exam/claude-architect-v1");
    await page.click('button:has-text("Start Exam")');
    await expect(page.getByText(/Q 1 \//)).toBeVisible({ timeout: 5000 });

    // Fast-forward 5 (real) seconds so the per-question timer ticks up.
    await page.clock.fastForward(5000);
    await expect(page.getByText(/⏳ 00:0[4-6]/)).toBeVisible();

    // Navigate to the next question - timer should reset back to ~00:00.
    await page.click('button:has-text("Next")');
    await expect(page.getByText(/Q 2 \//)).toBeVisible();
    await expect(page.getByText(/⏳ 00:0[01]/)).toBeVisible();
  });

  test("mark for review toggle and minimap jump preserve answers", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginAsCandidate(page);
    await page.goto("/mock-exam/claude-architect-v1");
    await page.click('button:has-text("Start Exam")');
    await expect(page.getByText(/Q 1 \//)).toBeVisible({ timeout: 5000 });

    // Mark question 1 for review - toggle button text flips.
    const markButton = page.getByRole("button", { name: /for review/i });
    await expect(markButton).toHaveText("☆ Mark for review");
    await markButton.click();
    await expect(markButton).toHaveText("★ Marked for review");

    // Answer question 1 (record the option's text so we can verify selection later).
    const firstOption = page.locator(".grid button").first();
    const firstOptionText = await firstOption.textContent();
    await firstOption.click();
    await expect(page.getByText("Answered: 1/")).toBeVisible();

    // Jump to question 3 via the minimap.
    const minimapCell3 = page.getByRole("button", { name: "3", exact: true });
    await minimapCell3.click();
    await expect(page.getByText(/Q 3 \//)).toBeVisible();

    // Jump back to question 1 via the minimap.
    const minimapCell1 = page.getByRole("button", { name: "1", exact: true });
    await minimapCell1.click();
    await expect(page.getByText(/Q 1 \//)).toBeVisible();

    // The previously selected option should still show as selected.
    const selectedOption = page.locator(".grid button.border-violet-500").first();
    await expect(selectedOption).toBeVisible();
    await expect(selectedOption).toHaveText(firstOptionText ?? "");

    // The mark-for-review state should also have persisted for question 1.
    await expect(markButton).toHaveText("★ Marked for review");
  });

  test("desktop minimap is visible with distinguishable answered/marked statuses", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginAsCandidate(page);
    await page.goto("/mock-exam/claude-architect-v1");
    await page.click('button:has-text("Start Exam")');
    await expect(page.getByText(/Q 1 \//)).toBeVisible({ timeout: 5000 });

    // Answer question 1.
    await page.locator(".grid button").first().click();
    await expect(page.getByText("Answered: 1/")).toBeVisible();

    // Mark question 2 for review.
    await page.click('button:has-text("Next")');
    await expect(page.getByText(/Q 2 \//)).toBeVisible();
    await page.getByRole("button", { name: /for review/i }).click();

    const minimapCell1 = page.getByRole("button", { name: "1", exact: true });
    const minimapCell2 = page.getByRole("button", { name: "2", exact: true });
    await expect(minimapCell1).toBeVisible();
    await expect(minimapCell2).toBeVisible();

    // Answered question 1 uses the violet "answered" styling.
    await expect(minimapCell1).toHaveClass(/bg-violet-600/);
    // Marked (but unanswered) question 2 uses the amber "marked" styling.
    await expect(minimapCell2).toHaveClass(/bg-amber-100/);
  });

  test("mobile viewport hides the minimap but navigation still works", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await loginAsCandidate(page);
    await page.goto("/mock-exam/claude-architect-v1");
    await page.click('button:has-text("Start Exam")');
    await expect(page.getByText(/Q 1 \//)).toBeVisible({ timeout: 5000 });

    const minimapCell1 = page.getByRole("button", { name: "1", exact: true });
    await expect(minimapCell1).not.toBeVisible();

    // Answer first question (pick any option).
    const firstOption = page.locator(".grid button").first();
    await firstOption.click();
    await expect(page.getByText("Answered: 1/")).toBeVisible();

    // Navigate to next.
    await page.click('button:has-text("Next")');
    await expect(page.getByText(/Q 2 \//)).toBeVisible();

    // Navigate back.
    await page.click('button:has-text("Previous")');
    await expect(page.getByText(/Q 1 \//)).toBeVisible();
  });

  test("submitting mock exam still redirects to review page after marking questions for review", async ({ page }) => {
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

      // Mark a couple of questions for review along the way.
      if (i === 0 || i === 2) {
        await page.getByRole("button", { name: /for review/i }).click();
      }

      if (i < total - 1) {
        await page.click('button:has-text("Next")');
      }
    }

    await page.click('button:has-text("Submit Exam")');
    await expect(page).toHaveURL(/\/mock-exam\/.*\/review\//, { timeout: 10000 });
  });
});
