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

test.describe("10 - PDF Score Report Export", () => {
  test("dashboard shows Download Score Report link", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    await expect(page.locator('[data-testid="download-report-btn"]')).toBeVisible();
  });

  test("dashboard Download Report link points to /api/report/pdf", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    const btn = page.locator('[data-testid="download-report-btn"]');
    const href = await btn.getAttribute("href");
    expect(href).toContain("/api/report/pdf");
  });

  test("API GET /api/report/pdf returns 401 without session", async ({ page }) => {
    const res = await page.request.get("/api/report/pdf");
    expect(res.status()).toBe(401);
  });

  test("API GET /api/report/pdf returns 200 and application/pdf for candidate", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    const res = await page.request.get("/api/report/pdf");
    expect(res.status()).toBe(200);
    const ct = res.headers()["content-type"];
    expect(ct).toContain("application/pdf");
  });

  test("API GET /api/report/pdf returns non-empty PDF body", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    const res = await page.request.get("/api/report/pdf");
    const body = await res.body();
    // PDF files start with %PDF
    expect(body.slice(0, 4).toString()).toBe("%PDF");
    expect(body.length).toBeGreaterThan(1000);
  });

  test("API GET /api/report/pdf returns Content-Disposition attachment header", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    const res = await page.request.get("/api/report/pdf");
    const cd = res.headers()["content-disposition"];
    expect(cd).toContain("attachment");
    expect(cd).toContain(".pdf");
  });

  test("API GET /api/report/pdf works for admin too", async ({ page }) => {
    await loginAs(page, ADMIN);
    const res = await page.request.get("/api/report/pdf");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("application/pdf");
  });

  test("API GET /api/report/pdf accepts examId filter", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    // Get an exam ID
    const examsRes = await page.request.get("/api/exams");
    const exams = await examsRes.json() as { id: string }[];
    if (exams.length > 0) {
      const res = await page.request.get(`/api/report/pdf?examId=${exams[0].id}`);
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain("application/pdf");
    }
  });
});
