import { test, expect, Page, Browser } from "@playwright/test";

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

async function inviteUser(page: Page, role: "ADMIN" | "CANDIDATE" = "CANDIDATE") {
  const email = `invitee-${Date.now()}-${Math.floor(performance.now())}@bistecglobal.com`;
  const res = await page.request.post("/api/admin/users", {
    data: { name: "Invited Person", email, role },
  });
  expect(res.status()).toBe(201);
  const body = (await res.json()) as { id: string; tempPassword: string };
  return { id: body.id, email, tempPassword: body.tempPassword };
}

async function freshLogin(browser: Browser, creds: { email: string; password: string }) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto("/login");
  await page.fill('input[name="email"]', creds.email);
  await page.fill('input[name="password"]', creds.password);
  await page.click('button[type="submit"]');
  return { ctx, page };
}

test.describe("17 - User Management (Admin)", () => {
  test("GET /api/admin/users returns 401 without session", async ({ page }) => {
    const res = await page.request.get("/api/admin/users");
    expect(res.status()).toBe(401);
  });

  test("candidate cannot list users (403)", async ({ page }) => {
    await loginAs(page, CANDIDATE);
    const res = await page.request.get("/api/admin/users");
    expect(res.status()).toBe(403);
  });

  test("admin lists users including seed accounts", async ({ page }) => {
    await loginAs(page, ADMIN);
    const res = await page.request.get("/api/admin/users");
    expect(res.ok()).toBeTruthy();
    const users = (await res.json()) as { email: string }[];
    expect(users.some((u) => u.email === ADMIN.email)).toBe(true);
    expect(users.some((u) => u.email === CANDIDATE.email)).toBe(true);
  });

  test("invite creates a user with a temp password that can log in", async ({ page, browser }) => {
    await loginAs(page, ADMIN);
    const invited = await inviteUser(page);
    expect(invited.tempPassword).toBeTruthy();

    const { ctx, page: userPage } = await freshLogin(browser, {
      email: invited.email,
      password: invited.tempPassword,
    });
    await expect(userPage).toHaveURL(/\/dashboard/);
    await ctx.close();
  });

  test("inviting a duplicate email returns 409", async ({ page }) => {
    await loginAs(page, ADMIN);
    const res = await page.request.post("/api/admin/users", {
      data: { name: "Dup", email: CANDIDATE.email, role: "CANDIDATE" },
    });
    expect(res.status()).toBe(409);
  });

  test("invite with invalid input returns 400", async ({ page }) => {
    await loginAs(page, ADMIN);
    const res = await page.request.post("/api/admin/users", {
      data: { name: "x", email: "not-an-email" },
    });
    expect(res.status()).toBe(400);
  });

  test("admin can change a user's role", async ({ page }) => {
    await loginAs(page, ADMIN);
    const invited = await inviteUser(page, "CANDIDATE");
    const res = await page.request.patch(`/api/admin/users/${invited.id}`, {
      data: { role: "ADMIN" },
    });
    expect(res.ok()).toBeTruthy();
    expect((await res.json()).role).toBe("ADMIN");
  });

  test("suspending a user blocks login; reactivating restores it", async ({ page, browser }) => {
    await loginAs(page, ADMIN);
    const invited = await inviteUser(page);

    // Suspend
    const susp = await page.request.patch(`/api/admin/users/${invited.id}`, {
      data: { status: "SUSPENDED" },
    });
    expect((await susp.json()).status).toBe("SUSPENDED");

    // Login now blocked — stays on /login with a suspended message
    const ctx = await browser.newContext();
    const userPage = await ctx.newPage();
    await userPage.goto("/login");
    await userPage.fill('input[name="email"]', invited.email);
    await userPage.fill('input[name="password"]', invited.tempPassword);
    await userPage.click('button[type="submit"]');
    await expect(userPage.locator("text=/suspended/i")).toBeVisible();
    await expect(userPage).toHaveURL(/\/login/);
    await ctx.close();

    // Reactivate
    const react = await page.request.patch(`/api/admin/users/${invited.id}`, {
      data: { status: "ACTIVE" },
    });
    expect((await react.json()).status).toBe("ACTIVE");

    const ok = await freshLogin(browser, { email: invited.email, password: invited.tempPassword });
    await expect(ok.page).toHaveURL(/\/dashboard/);
    await ok.ctx.close();
  });

  test("admin cannot suspend or demote their own account (400)", async ({ page }) => {
    await loginAs(page, ADMIN);
    const list = await (await page.request.get("/api/admin/users")).json();
    const me = (list as { id: string; email: string }[]).find((u) => u.email === ADMIN.email)!;

    const susp = await page.request.patch(`/api/admin/users/${me.id}`, {
      data: { status: "SUSPENDED" },
    });
    expect(susp.status()).toBe(400);

    const demote = await page.request.patch(`/api/admin/users/${me.id}`, {
      data: { role: "CANDIDATE" },
    });
    expect(demote.status()).toBe(400);
  });

  test("users page renders table and invite form", async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto("/admin/users");
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="invite-name-input"]')).toBeVisible();
  });

  test("invite via UI shows a temp password", async ({ page }) => {
    await loginAs(page, ADMIN);
    await page.goto("/admin/users");
    const email = `ui-invite-${Date.now()}@bistecglobal.com`;
    await page.fill('[data-testid="invite-name-input"]', "UI Invite");
    await page.fill('[data-testid="invite-email-input"]', email);
    await page.click('[data-testid="invite-btn"]');
    await expect(page.locator('[data-testid="invite-temp-password"]')).toBeVisible({ timeout: 5000 });
  });
});
