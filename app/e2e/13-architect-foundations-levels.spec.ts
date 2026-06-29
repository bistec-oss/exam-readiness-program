import { test, expect } from "@playwright/test";

const CANDIDATE = { email: "candidate@bistecglobal.com", password: "candidate123!" };
const EXAM_ID = "claude-architect-v1";

const DOMAIN_LEVELS = [
  { id: "cca-d1-agentic-orchestration", title: "Domain 1 · Agentic Architecture & Orchestration" },
  { id: "cca-d2-tool-mcp", title: "Domain 2 · Tool Design & MCP Integration" },
  { id: "cca-d3-claude-code", title: "Domain 3 · Claude Code Configuration & Workflows" },
  { id: "cca-d4-prompt-structured-output", title: "Domain 4 · Prompt Engineering & Structured Output" },
  { id: "cca-d5-context-reliability", title: "Domain 5 · Context Management & Reliability" },
];

// Practice Set B — additional synthetic questions per domain (8 each)
const DOMAIN_LEVELS_B = [
  { id: "cca-d1b-agentic-orchestration", title: "Domain 1 · Agentic Architecture & Orchestration — Practice Set B" },
  { id: "cca-d2b-tool-mcp", title: "Domain 2 · Tool Design & MCP Integration — Practice Set B" },
  { id: "cca-d3b-claude-code", title: "Domain 3 · Claude Code Configuration & Workflows — Practice Set B" },
  { id: "cca-d4b-prompt-structured-output", title: "Domain 4 · Prompt Engineering & Structured Output — Practice Set B" },
  { id: "cca-d5b-context-reliability", title: "Domain 5 · Context Management & Reliability — Practice Set B" },
];

const ALL_NEW_LEVELS = [...DOMAIN_LEVELS, ...DOMAIN_LEVELS_B];

async function loginAs(page: import("@playwright/test").Page, creds: { email: string; password: string }) {
  await page.goto("/login");
  await page.fill('input[name="email"]', creds.email);
  await page.fill('input[name="password"]', creds.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe("13 - Architect Foundations Levels (from exam guide PDF)", () => {
  test("all five domain levels appear on the Claude Architect exam page", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    await page.goto(`/exams/${EXAM_ID}`);
    for (const level of DOMAIN_LEVELS) {
      // exact match: Set B titles contain the Set A title as a substring
      await expect(page.getByText(level.title, { exact: true })).toBeVisible();
    }
  });

  test("each Set A domain level has exactly 6 questions", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    for (const level of DOMAIN_LEVELS) {
      const res = await page.request.get(`/api/challenges/${level.id}/questions`);
      expect(res.status()).toBe(200);
      const questions = (await res.json()) as { id: string; text: string }[];
      expect(questions.length).toBe(6);
    }
  });

  test("all five Practice Set B levels appear and each has 8 questions", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    await page.goto(`/exams/${EXAM_ID}`);
    for (const level of DOMAIN_LEVELS_B) {
      await expect(page.getByText(level.title, { exact: true })).toBeVisible();
      const res = await page.request.get(`/api/challenges/${level.id}/questions`);
      expect(res.status()).toBe(200);
      const questions = (await res.json()) as { id: string }[];
      expect(questions.length).toBe(8);
    }
  });

  test("every Set B question id is unique across all new levels (no duplicates)", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    const ids = new Set<string>();
    for (const level of ALL_NEW_LEVELS) {
      const questions = await (await page.request.get(`/api/challenges/${level.id}/questions`)).json() as { id: string }[];
      for (const q of questions) {
        expect(ids.has(q.id)).toBeFalsy();
        ids.add(q.id);
      }
    }
    // 5 Set A levels × 6 + 5 Set B levels × 8 = 70 distinct questions
    expect(ids.size).toBe(70);
  });

  test("levels include the real exam-guide sample questions", async ({ page }) => {
    await loginAs(page, CANDIDATE);

    // Domain 1 sample Q1: get_customer prerequisite blocking
    const d1 = await (await page.request.get("/api/challenges/cca-d1-agentic-orchestration/questions")).json() as { text: string }[];
    expect(d1.some((q) => q.text.includes("skips get_customer entirely"))).toBeTruthy();

    // Domain 3 sample Q4: -p flag for non-interactive CI
    const d3 = await (await page.request.get("/api/challenges/cca-d3-claude-code/questions")).json() as { text: string }[];
    expect(d3.some((q) => q.text.includes("hangs waiting for interactive input"))).toBeTruthy();

    // Domain 4 sample Q11: Message Batches API tradeoff
    const d4 = await (await page.request.get("/api/challenges/cca-d4-prompt-structured-output/questions")).json() as { text: string }[];
    expect(d4.some((q) => q.text.includes("Message Batches API"))).toBeTruthy();
  });

  test("every question in the new levels has a valid correct answer and explanation", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    for (const level of ALL_NEW_LEVELS) {
      const questions = await (await page.request.get(`/api/challenges/${level.id}/questions`)).json() as {
        options: { id: string; text: string }[];
        correctOptionId: string;
        explanation: string;
      }[];
      for (const q of questions) {
        expect(q.explanation.length).toBeGreaterThan(0);
        expect(q.options.some((o) => o.id === q.correctOptionId)).toBeTruthy();
      }
    }
  });

  test("candidate can navigate into a domain level and reach the play screen", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    await page.goto(`/exams/${EXAM_ID}`);
    await page.getByText("Domain 1 · Agentic Architecture & Orchestration", { exact: true }).click();
    await expect(page).toHaveURL(/\/challenges\/.*\/play/);
  });
});
