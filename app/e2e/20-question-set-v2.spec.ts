import { test, expect } from "@playwright/test";

const CANDIDATE = { email: "candidate@bistecglobal.com", password: "candidate123!" };
const EXAM_ID = "claude-architect-v1";

const SCENARIO_SETS = [
  { id: "cs-v2-scenario-1-customer-support-agent", title: "Customer Support Agent — Reliability & Idempotency", questionCount: 5 },
  { id: "cs-v2-scenario-2-code-generation", title: "Claude Code Session & Context Management", questionCount: 5 },
  { id: "cs-v2-scenario-3-multi-agent-research", title: "Multi-Agent Coordinator Reliability", questionCount: 5 },
  { id: "cs-v2-scenario-4-developer-productivity", title: "Developer Productivity with Claude", questionCount: 5 },
  { id: "cs-v2-scenario-5-cicd", title: "Claude Code for CI/CD", questionCount: 5 },
  { id: "cs-v2-scenario-6-structured-data-extraction", title: "Structured Data Extraction", questionCount: 5 },
];

const DOMAIN_SETS = [
  { id: "cs-v2-domain-1-agentic-orchestration", title: "Agentic Architecture and Orchestration", questionCount: 6 },
  { id: "cs-v2-domain-2-tool-mcp-design", title: "Tool Design and MCP Integration", questionCount: 6 },
  { id: "cs-v2-domain-3-claude-code-config", title: "Claude Code Configuration and Workflows", questionCount: 6 },
  { id: "cs-v2-domain-4-prompt-structured-output", title: "Prompt Engineering and Structured Output", questionCount: 6 },
  { id: "cs-v2-domain-5-context-reliability", title: "Context Management and Reliability", questionCount: 6 },
];

const ALL_V2_SETS = [...SCENARIO_SETS, ...DOMAIN_SETS];

async function loginAs(page: import("@playwright/test").Page, creds: { email: string; password: string }) {
  await page.goto("/login");
  await page.fill('input[name="email"]', creds.email);
  await page.fill('input[name="password"]', creds.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe("20 - Claude Architect Question Set v2 (60 new questions)", () => {
  test("all 11 new v2 challenge sets appear on the Claude Architect exam page", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    await page.goto(`/exams/${EXAM_ID}`);
    for (const set of ALL_V2_SETS) {
      await expect(page.getByText(set.title, { exact: true })).toBeVisible();
    }
  });

  test("each new v2 challenge set returns its expected question count", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    for (const set of ALL_V2_SETS) {
      const res = await page.request.get(`/api/challenges/${set.id}/questions`);
      expect(res.status()).toBe(200);
      const questions = (await res.json()) as { id: string }[];
      expect(questions.length).toBe(set.questionCount);
    }
  });

  test("every v2 question id is unique across all 11 new sets (60 total)", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    const ids = new Set<string>();
    for (const set of ALL_V2_SETS) {
      const questions = (await (await page.request.get(`/api/challenges/${set.id}/questions`)).json()) as { id: string }[];
      for (const q of questions) {
        expect(ids.has(q.id)).toBeFalsy();
        ids.add(q.id);
      }
    }
    expect(ids.size).toBe(60);
  });

  test("every v2 question has a valid correct answer and non-empty explanation", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    for (const set of ALL_V2_SETS) {
      const questions = (await (await page.request.get(`/api/challenges/${set.id}/questions`)).json()) as {
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

  test("candidate can navigate into a v2 scenario set and reach the play screen", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    await page.goto(`/exams/${EXAM_ID}`);
    await page.getByText("Customer Support Agent — Reliability & Idempotency", { exact: true }).click();
    await expect(page).toHaveURL(/\/challenges\/.*\/play/);
  });

  test("candidate can play through a full v2 domain challenge set end-to-end", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    await page.goto("/challenges/cs-v2-domain-1-agentic-orchestration/play");

    for (let i = 0; i < 6; i++) {
      const buttons = page.locator(".grid button");
      await expect(buttons.first()).toBeVisible({ timeout: 5000 });
      await buttons.first().click();

      const nextBtn = page.getByRole("button", { name: /Next Question|See Results/ });
      await expect(nextBtn).toBeVisible({ timeout: 3000 });
      await nextBtn.click();
    }

    await expect(page.getByText("Challenge Complete!")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/XP earned/)).toBeVisible();
  });
});
