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

test.describe("16 - Weekly Email Notifications", () => {
  test("GET /api/notifications returns 401 without session", async ({ page }) => {
    const res = await page.request.get("/api/notifications");
    expect(res.status()).toBe(401);
  });

  test("POST /api/notifications/weekly returns 401 without session", async ({ page }) => {
    const res = await page.request.post("/api/notifications/weekly");
    expect(res.status()).toBe(401);
  });

  test("candidate cannot trigger the weekly run (403)", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    const res = await page.request.post("/api/notifications/weekly");
    expect(res.status()).toBe(403);
  });

  test("preferences PATCH validates types", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    const res = await page.request.patch("/api/me/preferences", {
      data: { weeklyEmailOptIn: "yes" },
    });
    expect(res.status()).toBe(400);
  });

  test("admin run generates a summary for opted-in candidate", async ({ page }) => {
    // Candidate opts in to weekly email.
    await loginAs(page, CANDIDATE);
    const prefRes = await page.request.patch("/api/me/preferences", {
      data: { weeklyEmailOptIn: true },
    });
    expect(prefRes.ok()).toBeTruthy();

    // Admin triggers the weekly run.
    await loginAs(page, ADMIN);
    const runRes = await page.request.post("/api/notifications/weekly");
    expect(runRes.status()).toBe(201);
    const runBody = (await runRes.json()) as { sent: number };
    expect(runBody.sent).toBeGreaterThanOrEqual(1);

    // Candidate sees the generated summary.
    await loginAs(page, CANDIDATE);
    const inboxRes = await page.request.get("/api/notifications");
    const inbox = (await inboxRes.json()) as { subject: string; type: string }[];
    expect(inbox.length).toBeGreaterThanOrEqual(1);
    expect(inbox[0].type).toBe("WEEKLY_SUMMARY");
    expect(inbox[0].subject).toMatch(/weekly readiness/i);
  });

  test("opted-out user receives no summary", async ({ browser }) => {
    // Fresh user via registration in an isolated context.
    const userCtx = await browser.newContext();
    const userPage = await userCtx.newPage();
    const email = `optout-${Date.now()}@bistecglobal.com`;
    await userPage.goto("/register");
    await userPage.fill('input[name="name"]', "Opt Out User");
    await userPage.fill('input[name="email"]', email);
    await userPage.fill('input[name="password"]', "password123!");
    await userPage.click('button[type="submit"]');
    await expect(userPage).toHaveURL(/\/dashboard/);

    // Opt out of weekly email.
    const optRes = await userPage.request.patch("/api/me/preferences", {
      data: { weeklyEmailOptIn: false },
    });
    expect(optRes.ok()).toBeTruthy();

    // Admin runs the weekly job in a separate context.
    const adminCtx = await browser.newContext();
    const adminPage = await adminCtx.newPage();
    await loginAs(adminPage, ADMIN);
    const runRes = await adminPage.request.post("/api/notifications/weekly");
    expect(runRes.status()).toBe(201);

    // The opted-out user has zero notifications.
    const inboxRes = await userPage.request.get("/api/notifications");
    const inbox = (await inboxRes.json()) as unknown[];
    expect(inbox.length).toBe(0);

    await userCtx.close();
    await adminCtx.close();
  });

  test("settings page shows weekly email toggle and inbox", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    await page.request.patch("/api/me/preferences", { data: { weeklyEmailOptIn: true } });
    await loginAs(page, ADMIN);
    await page.request.post("/api/notifications/weekly");

    await loginAs(page, CANDIDATE);
    await page.goto("/settings");
    await expect(page.locator('[data-testid="weekly-email-toggle"]')).toBeVisible();
    await expect(page.locator('[data-testid="notifications-inbox"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification-item"]').first()).toBeVisible();
  });
});
