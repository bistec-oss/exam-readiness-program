import { test, expect } from "@playwright/test";

const ADMIN = { email: "admin@bistecglobal.com", password: "admin123!" };
const CANDIDATE = { email: "candidate@bistecglobal.com", password: "candidate123!" };

async function loginAs(page: import("@playwright/test").Page, creds: { email: string; password: string }) {
  await page.goto("/login");
  await page.fill('input[name="email"]', creds.email);
  await page.fill('input[name="password"]', creds.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe("11 - Cohort Manager View", () => {
  test("admin panel shows Cohorts link", async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto("/admin");
    await expect(page.locator("text=Cohorts")).toBeVisible();
  });

  test("cohorts page loads for admin", async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto("/admin/cohorts");
    await expect(page.locator("text=Cohort Manager")).toBeVisible();
  });

  test("cohorts page redirects non-admin to dashboard", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    await page.goto("/admin/cohorts");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("API GET /api/cohorts returns 403 for candidate", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    const res = await page.request.get("/api/cohorts");
    expect(res.status()).toBe(403);
  });

  test("API GET /api/cohorts returns 401 without session", async ({ page }) => {
    const res = await page.request.get("/api/cohorts");
    expect(res.status()).toBe(401);
  });

  test("admin can create a cohort via API", async ({ page }) => {
    await loginAs(page, ADMIN);
    const name = `Test Cohort ${Date.now()}`;
    const res = await page.request.post("/api/cohorts", {
      data: { name },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.name).toBe(name);
    expect(body.code).toMatch(/^[A-F0-9]{8}$/);
    expect(body.id).toBeTruthy();
  });

  test("create cohort returns 400 when name missing", async ({ page }) => {
    await loginAs(page, ADMIN);
    const res = await page.request.post("/api/cohorts", { data: {} });
    expect(res.status()).toBe(400);
  });

  test("admin can create cohort and it appears in list", async ({ page }) => {
    await loginAs(page, ADMIN);
    const name = `E2E Cohort ${Date.now()}`;
    await page.request.post("/api/cohorts", { data: { name } });

    const listRes = await page.request.get("/api/cohorts");
    const cohorts = await listRes.json() as { name: string }[];
    expect(cohorts.some((c) => c.name === name)).toBe(true);
  });

  test("cohort detail page shows readiness summary", async ({ page }) => {
    await loginAs(page, ADMIN);
    const createRes = await page.request.post("/api/cohorts", {
      data: { name: `Detail Test ${Date.now()}` },
    });
    const cohort = await createRes.json() as { id: string };

    await page.goto(`/admin/cohorts/${cohort.id}`);
    await expect(page.locator('[data-testid="cohort-readiness-summary"]')).toBeVisible();
    await expect(page.locator("text=members ≥ 80% ready")).toBeVisible();
  });

  test("admin can add a member to cohort via API", async ({ page }) => {
    await loginAs(page, ADMIN);
    const createRes = await page.request.post("/api/cohorts", {
      data: { name: `Member Test ${Date.now()}` },
    });
    const cohort = await createRes.json() as { id: string };

    const addRes = await page.request.post(`/api/cohorts/${cohort.id}/members`, {
      data: { email: CANDIDATE.email },
    });
    expect(addRes.status()).toBe(201);
  });

  test("adding a member with unknown email returns 404", async ({ page }) => {
    await loginAs(page, ADMIN);
    const createRes = await page.request.post("/api/cohorts", {
      data: { name: `Email 404 Test ${Date.now()}` },
    });
    const cohort = await createRes.json() as { id: string };

    const res = await page.request.post(`/api/cohorts/${cohort.id}/members`, {
      data: { email: "nobody@nowhere.invalid" },
    });
    expect(res.status()).toBe(404);
  });

  test("cohort detail shows member after adding", async ({ page }) => {
    await loginAs(page, ADMIN);
    const createRes = await page.request.post("/api/cohorts", {
      data: { name: `Show Member ${Date.now()}` },
    });
    const cohort = await createRes.json() as { id: string };
    await page.request.post(`/api/cohorts/${cohort.id}/members`, {
      data: { email: CANDIDATE.email },
    });

    await page.goto(`/admin/cohorts/${cohort.id}`);
    await expect(page.locator('[data-testid="cohort-members-table"]')).toBeVisible();
    await expect(page.locator("text=Demo Candidate")).toBeVisible();
  });

  test("cohort UI create form works end-to-end", async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto("/admin/cohorts");
    const name = `UI Cohort ${Date.now()}`;
    await page.fill('[data-testid="cohort-name-input"]', name);
    await page.click('[data-testid="create-cohort-btn"]');
    await expect(page.locator(`text=${name}`)).toBeVisible({ timeout: 5000 });
  });
});
