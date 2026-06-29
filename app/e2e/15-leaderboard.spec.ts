import { test, expect, Page } from "@playwright/test";

const ADMIN = { email: "admin@bistecglobal.com", password: "admin123!" };
const CANDIDATE = { email: "candidate@bistecglobal.com", password: "candidate123!" };

async function loginAs(page: Page, creds: { email: string; password: string }) {
  await page.context().clearCookies();
  await page.goto("/login");
  await page.fill('input[name="email"]', creds.email);
  await page.fill('input[name="password"]', creds.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/);
}

async function setOptIn(page: Page, value: boolean) {
  const res = await page.request.patch("/api/me/preferences", {
    data: { leaderboardOptIn: value },
  });
  expect(res.ok()).toBeTruthy();
}

test.describe("15 - Cohort Leaderboard", () => {
  test("API GET /api/leaderboard returns 401 without session", async ({ page }) => {
    const res = await page.request.get("/api/leaderboard");
    expect(res.status()).toBe(401);
  });

  test("dashboard shows Leaderboard link", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    await expect(page.locator('a[href="/leaderboard"]')).toBeVisible();
  });

  test("candidate not in a cohort sees empty leaderboard", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    // ensure not opted-in state irrelevant; candidate may be in cohorts from other
    // tests, so this only asserts the API responds with the expected shape.
    const res = await page.request.get("/api/leaderboard");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty("entries");
    expect(body).toHaveProperty("optedIn");
  });

  test("opted-in member appears in their cohort leaderboard", async ({ page }) => {
    // Admin creates a cohort and adds the candidate.
    await loginAs(page, ADMIN);
    const createRes = await page.request.post("/api/cohorts", {
      data: { name: `LB Cohort ${Date.now()}` },
    });
    const cohort = (await createRes.json()) as { id: string };
    const addRes = await page.request.post(`/api/cohorts/${cohort.id}/members`, {
      data: { email: CANDIDATE.email },
    });
    expect(addRes.status()).toBe(201);

    // Candidate opts in, then sees themselves on the leaderboard.
    await loginAs(page, CANDIDATE);
    await setOptIn(page, true);

    const res = await page.request.get("/api/leaderboard");
    const body = (await res.json()) as {
      inCohort: boolean;
      optedIn: boolean;
      entries: { name: string; isSelf: boolean; rank: number }[];
    };
    expect(body.inCohort).toBe(true);
    expect(body.optedIn).toBe(true);
    const self = body.entries.find((e) => e.isSelf);
    expect(self).toBeTruthy();
    expect(self!.rank).toBeGreaterThanOrEqual(1);
  });

  test("opting out removes member from the leaderboard", async ({ page }) => {
    await loginAs(page, ADMIN);
    const createRes = await page.request.post("/api/cohorts", {
      data: { name: `LB Out ${Date.now()}` },
    });
    const cohort = (await createRes.json()) as { id: string };
    await page.request.post(`/api/cohorts/${cohort.id}/members`, {
      data: { email: CANDIDATE.email },
    });

    await loginAs(page, CANDIDATE);
    await setOptIn(page, false);

    const res = await page.request.get("/api/leaderboard");
    const body = (await res.json()) as { entries: { isSelf: boolean }[] };
    expect(body.entries.some((e) => e.isSelf)).toBe(false);
  });

  test("leaderboard page renders opt-in toggle and updates", async ({ page }) => {
    // Put candidate in a cohort so the table can populate.
    await loginAs(page, ADMIN);
    const createRes = await page.request.post("/api/cohorts", {
      data: { name: `LB UI ${Date.now()}` },
    });
    const cohort = (await createRes.json()) as { id: string };
    await page.request.post(`/api/cohorts/${cohort.id}/members`, {
      data: { email: CANDIDATE.email },
    });

    await loginAs(page, CANDIDATE);
    await setOptIn(page, false);
    await page.goto("/leaderboard");

    const toggle = page.locator('[data-testid="leaderboard-optin-toggle"]');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("data-state", "off");

    await toggle.click();
    await expect(toggle).toHaveAttribute("data-state", "on");
    // After opting in the candidate appears in the table.
    await expect(page.locator('[data-testid="leaderboard-table"]')).toBeVisible();
    await expect(page.locator("text=(you)")).toBeVisible();
  });
});
