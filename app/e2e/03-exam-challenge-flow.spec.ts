import { test, expect } from "@playwright/test";

const CANDIDATE = { email: "candidate@bistecglobal.com", password: "candidate123!" };

async function loginAsCandidate(page: Parameters<typeof test>[1] extends (args: { page: infer P }) => unknown ? P : never) {
  await page.goto("/login");
  await page.fill('input[name="email"]', CANDIDATE.email);
  await page.fill('input[name="password"]', CANDIDATE.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe("03 - Exam Catalog & Challenge Flow", () => {
  test("dashboard links to exam catalog", async ({ page }) => {
    await loginAsCandidate(page);
    await expect(page.getByText("Exam Catalog")).toBeVisible();
    await page.click("text=Exam Catalog");
    await expect(page).toHaveURL(/\/exams/);
  });

  test("exam catalog shows Claude Architect exam", async ({ page }) => {
    await loginAsCandidate(page);
    await page.goto("/exams");
    await expect(page.getByText("Claude Architect Certification")).toBeVisible();
    await expect(page.getByText(/challenge sets/).first()).toBeVisible();
  });

  test("unauthenticated user redirected from /exams to /login", async ({ page }) => {
    await page.goto("/exams");
    await expect(page).toHaveURL(/\/login/);
  });

  test("exam page shows challenge sets", async ({ page }) => {
    await loginAsCandidate(page);
    await page.goto("/exams");
    await page.click("text=Claude Architect Certification");
    await expect(page).toHaveURL(/\/exams\//);
    await expect(page.getByText("Safety & Responsible AI")).toBeVisible();
    await expect(page.getByText("Claude Model Capabilities")).toBeVisible();
    await expect(page.getByText("Architect Patterns & System Design")).toBeVisible();
  });

  test("exam page has Full Mock Exam button", async ({ page }) => {
    await loginAsCandidate(page);
    await page.goto("/exams/claude-architect-v1");
    await expect(page.getByText("Full Mock Exam")).toBeVisible();
  });

  test("challenge play page loads questions", async ({ page }) => {
    await loginAsCandidate(page);
    await page.goto("/exams/claude-architect-v1");
    await page.click("text=Safety & Responsible AI");
    await expect(page).toHaveURL(/\/challenges\/.*\/play/);
    await expect(page.getByText(/1\//)).toBeVisible();
  });

  test("candidate can answer a flashcard question and see feedback", async ({ page }) => {
    await loginAsCandidate(page);
    await page.goto("/challenges/cs-safety-principles/play");
    // Should see first question
    await expect(page.getByText(/Which principle is central/)).toBeVisible();
    // Click an answer option
    await page.click("button:has-text('Constitutional AI and harmlessness')");
    // Should see feedback
    await expect(page.getByText("✅ Correct!")).toBeVisible();
    await expect(page.getByText(/Anthropic uses Constitutional AI/)).toBeVisible();
  });

  test("candidate can complete a full challenge set", async ({ page }) => {
    await loginAsCandidate(page);
    await page.goto("/challenges/cs-model-capabilities/play");

    const correctAnswers: Record<string, string> = {
      "q-cap-1": "Claude Sonnet",
      "q-cap-2": "maximum number of tokens",
      "q-cap-3": "False",
      "q-cap-4": "mechanism allowing Claude to call",
      "q-cap-5": "randomness",
      "q-cap-6": "True",
      "q-cap-7": "Claude Haiku",
    };

    // Answer all questions — pick correct where possible, otherwise any
    for (let i = 0; i < 7; i++) {
      // Wait for next question to be visible
      await page.waitForSelector("button:has-text('A')", { timeout: 5000 }).catch(() => null);

      // Click the first available option button
      const buttons = page.locator(".grid button");
      const count = await buttons.count();
      if (count > 0) {
        // Find correct option if possible
        let clicked = false;
        for (const [, textSnippet] of Object.entries(correctAnswers)) {
          const matchBtn = page.locator(`button:has-text("${textSnippet}")`).first();
          if (await matchBtn.isVisible()) {
            await matchBtn.click();
            clicked = true;
            break;
          }
        }
        if (!clicked) {
          await buttons.first().click();
        }
      }

      // Click next / see results
      const nextBtn = page.getByRole("button", { name: /Next Question|See Results/ });
      await expect(nextBtn).toBeVisible({ timeout: 3000 });
      await nextBtn.click();
    }

    // Should see completion screen
    await expect(page.getByText("Challenge Complete!")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/XP earned/)).toBeVisible();
  });

  test("API GET /api/exams returns exams for authenticated user", async ({ request, page }) => {
    // Log in to get session cookie
    await loginAsCandidate(page);
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === "session");

    const res = await request.get("/api/exams", {
      headers: { Cookie: `session=${sessionCookie?.value}` },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty("name");
  });

  test("API GET /api/exams returns 401 without session", async ({ request }) => {
    const res = await request.get("/api/exams");
    expect(res.status()).toBe(401);
  });
});
