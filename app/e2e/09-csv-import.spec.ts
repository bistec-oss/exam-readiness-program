import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";
import os from "os";

const ADMIN = { email: "admin@bistecglobal.com", password: "admin123!" };
const CANDIDATE = { email: "candidate@bistecglobal.com", password: "candidate123!" };

async function loginAs(page: import("@playwright/test").Page, creds: { email: string; password: string }) {
  await page.goto("/login");
  await page.fill('input[name="email"]', creds.email);
  await page.fill('input[name="password"]', creds.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe("09 - CSV Bulk Question Import", () => {
  test("admin questions page has Bulk Import CSV button", async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto("/admin/questions");
    await expect(page.getByText("Bulk Import CSV")).toBeVisible();
  });

  test("import page loads for admin", async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto("/admin/questions/import");
    await expect(page.getByText("Bulk Import Questions")).toBeVisible();
    await expect(page.locator('[data-testid="csv-file-input"]')).toBeVisible();
  });

  test("import page redirects non-admin to login", async ({ page }) => {
    await page.goto("/admin/questions/import");
    await expect(page).toHaveURL(/\/login/);
  });

  test("API POST /api/admin/questions/import returns 403 for candidate", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    const res = await page.request.post("/api/admin/questions/import", {
      multipart: { file: { name: "test.csv", mimeType: "text/csv", buffer: Buffer.from("text\nq1") } },
    });
    expect(res.status()).toBe(403);
  });

  test("API POST /api/admin/questions/import returns 400 for empty CSV", async ({ page }) => {
    await loginAs(page, ADMIN);
    const res = await page.request.post("/api/admin/questions/import", {
      multipart: { file: { name: "empty.csv", mimeType: "text/csv", buffer: Buffer.from("text\n") } },
    });
    expect(res.status()).toBe(400);
  });

  test("API POST /api/admin/questions/import returns 400 when no file", async ({ page }) => {
    await loginAs(page, ADMIN);
    const res = await page.request.post("/api/admin/questions/import", {
      multipart: {},
    });
    expect(res.status()).toBe(400);
  });

  test("API POST /api/admin/questions/import creates questions from valid CSV", async ({ page }) => {
    await loginAs(page, ADMIN);

    // Get a valid exam name first
    const examsRes = await page.request.get("/api/admin/exams");
    const exams = await examsRes.json() as { name: string }[];
    expect(exams.length).toBeGreaterThan(0);
    const examName = exams[0].name;

    const csvContent = [
      "text,type,option_a,option_b,option_c,option_d,correct_option,explanation,exam_name,preamble,challenge_set_title",
      `"CSV Import Test Q ${Date.now()}",MCQ,"Option A","Option B","Option C","Option D",a,"Because A is correct","${examName}",,`,
    ].join("\n");

    const res = await page.request.post("/api/admin/questions/import", {
      multipart: {
        file: { name: "questions.csv", mimeType: "text/csv", buffer: Buffer.from(csvContent) },
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json() as { created: number; updated: number; errors: string[] };
    expect(body.created).toBeGreaterThanOrEqual(1);
  });

  test("API POST /api/admin/questions/import is idempotent (re-import updates not creates)", async ({ page }) => {
    await loginAs(page, ADMIN);

    const examsRes = await page.request.get("/api/admin/exams");
    const exams = await examsRes.json() as { name: string }[];
    const examName = exams[0].name;

    const uniqueText = `Idempotent Test Q ${Date.now()}`;
    const csvContent = [
      "text,type,option_a,option_b,option_c,option_d,correct_option,explanation,exam_name,preamble,challenge_set_title",
      `"${uniqueText}",MCQ,"Option A","Option B","Option C","Option D",b,"Because B","${examName}",,`,
    ].join("\n");

    // First import
    const res1 = await page.request.post("/api/admin/questions/import", {
      multipart: { file: { name: "q.csv", mimeType: "text/csv", buffer: Buffer.from(csvContent) } },
    });
    const body1 = await res1.json() as { created: number; updated: number };
    expect(body1.created).toBe(1);

    // Second import — same text — should update
    const res2 = await page.request.post("/api/admin/questions/import", {
      multipart: { file: { name: "q.csv", mimeType: "text/csv", buffer: Buffer.from(csvContent) } },
    });
    const body2 = await res2.json() as { created: number; updated: number };
    expect(body2.updated).toBe(1);
    expect(body2.created).toBe(0);
  });

  test("import page shows result summary after successful upload", async ({ page }) => {
    await loginAs(page, ADMIN);

    const examsRes = await page.request.get("/api/admin/exams");
    const exams = await examsRes.json() as { name: string }[];
    const examName = exams[0].name;

    const csvContent = [
      "text,type,option_a,option_b,option_c,option_d,correct_option,explanation,exam_name,preamble,challenge_set_title",
      `"UI Upload Test Q ${Date.now()}",MCQ,"A","B","C","D",a,"Explanation","${examName}",,`,
    ].join("\n");

    // Write CSV to temp file and upload via UI
    const tmpFile = path.join(os.tmpdir(), `test-import-${Date.now()}.csv`);
    fs.writeFileSync(tmpFile, csvContent);

    await page.goto("/admin/questions/import");
    await page.setInputFiles('[data-testid="csv-file-input"]', tmpFile);
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-testid="import-result"]')).toBeVisible();

    fs.unlinkSync(tmpFile);
  });
});
