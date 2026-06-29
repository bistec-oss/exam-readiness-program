import { test, expect } from "@playwright/test";

const CANDIDATE = { email: "candidate@bistecglobal.com", password: "candidate123!" };

async function loginAs(page: import("@playwright/test").Page, creds: { email: string; password: string }) {
  await page.goto("/login");
  await page.fill('input[name="email"]', creds.email);
  await page.fill('input[name="password"]', creds.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe("12 - Additional Exam Catalogs", () => {
  test("exam catalog lists at least 4 exams", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    await page.goto("/exams");
    const examCards = page.locator("[data-testid='exam-card']");
    const count = await examCards.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test("AWS exam appears in catalog", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    await page.goto("/exams");
    await expect(page.locator("text=AWS Solutions Architect")).toBeVisible();
  });

  test("Azure exam appears in catalog", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    await page.goto("/exams");
    await expect(page.locator("text=Azure AZ-900")).toBeVisible();
  });

  test("Scrum exam appears in catalog", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    await page.goto("/exams");
    await expect(page.locator("text=Scrum PSM-I")).toBeVisible();
  });

  test("API returns 4 exams", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    const res = await page.request.get("/api/exams");
    expect(res.status()).toBe(200);
    const exams = await res.json() as { name: string }[];
    expect(exams.length).toBeGreaterThanOrEqual(4);
  });

  test("AWS exam has challenge sets", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    const examsRes = await page.request.get("/api/exams");
    const exams = await examsRes.json() as { id: string; name: string }[];
    const aws = exams.find((e) => e.name.includes("AWS"));
    expect(aws).toBeTruthy();

    await page.goto(`/exams/${aws!.id}`);
    await expect(page.locator("text=Compute & Networking")).toBeVisible();
  });

  test("Azure exam has challenge sets", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    const examsRes = await page.request.get("/api/exams");
    const exams = await examsRes.json() as { id: string; name: string }[];
    const azure = exams.find((e) => e.name.includes("Azure"));
    expect(azure).toBeTruthy();

    await page.goto(`/exams/${azure!.id}`);
    await expect(page.locator("h3", { hasText: "Cloud Concepts" })).toBeVisible();
  });

  test("Scrum exam has challenge sets", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    const examsRes = await page.request.get("/api/exams");
    const exams = await examsRes.json() as { id: string; name: string }[];
    const scrum = exams.find((e) => e.name.includes("Scrum"));
    expect(scrum).toBeTruthy();

    await page.goto(`/exams/${scrum!.id}`);
    await expect(page.locator("h3", { hasText: "Scrum Theory" })).toBeVisible();
  });

  test("can navigate into AWS challenge set", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    const examsRes = await page.request.get("/api/exams");
    const exams = await examsRes.json() as { id: string; name: string }[];
    const aws = exams.find((e) => e.name.includes("AWS"));
    expect(aws).toBeTruthy();

    await page.goto(`/exams/${aws!.id}`);
    // Click the first challenge set card
    await page.locator("text=Compute & Networking").click();
    // Should be on the play page
    await expect(page).toHaveURL(/\/challenges\/.*\/play/);
  });
});
