import { test, expect } from "@playwright/test";

const ADMIN = { email: "admin@bistecglobal.com", password: "admin123!" };
const CANDIDATE = { email: "candidate@bistecglobal.com", password: "candidate123!" };
const EXAM_ID = "claude-architect-v1";

async function loginAs(page: import("@playwright/test").Page, creds: { email: string; password: string }) {
  await page.goto("/login");
  await page.fill('input[name="email"]', creds.email);
  await page.fill('input[name="password"]', creds.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe("14 - CSV bulk import", () => {
  test("admin imports valid MCQ + TRUE_FALSE rows", async ({ page }) => {
    await loginAs(page, ADMIN);
    const marker = `IMPORT_${Date.now()}`;
    const csv =
      "examId,challengeSetId,type,text,preamble,correctOptionId,explanation,optionA,optionB,optionC,optionD\n" +
      `${EXAM_ID},,MCQ,${marker} which is correct?,,b,Because B.,Wrong,Right,Nope,Nah\n` +
      `${EXAM_ID},,TRUE_FALSE,${marker} the sky is blue,,true,It is.,,,,`;

    const res = await page.request.post("/api/admin/questions/import", {
      data: { csv },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.imported).toBe(2);
    expect(body.failed).toBe(0);
  });

  test("invalid rows are reported and skipped", async ({ page }) => {
    await loginAs(page, ADMIN);
    const csv =
      "examId,type,text,correctOptionId,explanation,optionA,optionB\n" +
      `${EXAM_ID},MCQ,Valid question,a,ok,Yes,No\n` +
      `nonexistent-exam,MCQ,Bad exam,a,ok,Yes,No\n` +
      `${EXAM_ID},MCQ,Bad correct id,z,ok,Yes,No`;
    const res = await page.request.post("/api/admin/questions/import", { data: { csv } });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.imported).toBe(1);
    expect(body.failed).toBe(2);
    expect(body.errors.length).toBe(2);
  });

  test("missing csv body returns 400", async ({ page }) => {
    await loginAs(page, ADMIN);
    const res = await page.request.post("/api/admin/questions/import", { data: {} });
    expect(res.status()).toBe(400);
  });

  test("candidate cannot import (403)", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    const res = await page.request.post("/api/admin/questions/import", {
      data: { csv: "examId,type,text,correctOptionId,explanation,optionA,optionB\n" + `${EXAM_ID},MCQ,x,a,y,A,B` },
    });
    expect(res.status()).toBe(403);
  });

  test("admin questions page shows the bulk import UI", async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto("/admin/questions");
    await expect(page.getByText("Bulk Import (CSV)")).toBeVisible();
    await expect(page.getByTestId("csv-import-btn")).toBeVisible();
  });
});

test.describe("14 - PDF score report export", () => {
  test("candidate downloads a valid PDF report", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    const res = await page.request.get("/api/progress/report");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("application/pdf");
    expect(res.headers()["content-disposition"]).toContain("attachment");
    const body = await res.body();
    expect(body.subarray(0, 5).toString("latin1")).toBe("%PDF-");
    expect(body.subarray(-6).toString("latin1")).toContain("%%EOF");
  });

  test("unauthenticated report request returns 401", async ({ page }) => {
    const res = await page.request.get("/api/progress/report");
    expect(res.status()).toBe(401);
  });

  test("dashboard shows the PDF report download link", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    const link = page.getByTestId("download-report");
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/api/progress/report");
  });
});
