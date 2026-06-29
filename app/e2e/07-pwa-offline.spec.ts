import { test, expect } from "@playwright/test";

const CANDIDATE = { email: "candidate@bistecglobal.com", password: "candidate123!" };

async function loginAsCandidate(page: Parameters<typeof test>[1] extends (args: { page: infer P }) => unknown ? P : never) {
  await page.goto("/login");
  await page.fill('input[name="email"]', CANDIDATE.email);
  await page.fill('input[name="password"]', CANDIDATE.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe("07 - PWA Offline Support", () => {
  test("manifest.json is served with correct content-type", async ({ request }) => {
    const res = await request.get("/manifest.json");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("application/json");
  });

  test("manifest.json has required PWA fields", async ({ request }) => {
    const res = await request.get("/manifest.json");
    const manifest = await res.json();
    expect(manifest).toHaveProperty("name");
    expect(manifest).toHaveProperty("short_name");
    expect(manifest).toHaveProperty("start_url");
    expect(manifest).toHaveProperty("display");
    expect(manifest).toHaveProperty("icons");
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThan(0);
    expect(manifest.icons[0]).toHaveProperty("src");
    expect(manifest.icons[0]).toHaveProperty("sizes");
  });

  test("page has <link rel=manifest> in head", async ({ page }) => {
    await page.goto("/");
    const count = await page.locator('link[rel="manifest"]').count();
    expect(count).toBeGreaterThanOrEqual(1);
    const href = await page.locator('link[rel="manifest"]').first().getAttribute("href");
    expect(href).toBe("/manifest.json");
  });

  test("page has theme-color meta tag", async ({ page }) => {
    await page.goto("/");
    const themeMeta = page.locator('meta[name="theme-color"]');
    await expect(themeMeta).toHaveCount(1);
  });

  test("page has apple-mobile-web-app-capable meta tag", async ({ page }) => {
    await page.goto("/");
    const appleMeta = page.locator('meta[name="apple-mobile-web-app-capable"]');
    await expect(appleMeta).toHaveCount(1);
  });

  test("service worker is registered", async ({ page }) => {
    await page.goto("/");
    const hasSW = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) return false;
      const regs = await navigator.serviceWorker.getRegistrations();
      return regs.length > 0;
    });
    expect(hasSW).toBe(true);
  });

  test("PWA icon files are served", async ({ request }) => {
    const res192 = await request.get("/icons/icon-192.png");
    expect(res192.status()).toBe(200);
    const res512 = await request.get("/icons/icon-512.png");
    expect(res512.status()).toBe(200);
  });

  test("API POST /api/attempts/sync returns 401 without session", async ({ request }) => {
    const res = await request.post("/api/attempts/sync", {
      data: { id: "test-id", challengeSetId: "cs-1", answers: {} },
    });
    expect(res.status()).toBe(401);
  });

  test("API POST /api/attempts/sync syncs a queued attempt", async ({ request, page }) => {
    await loginAsCandidate(page);
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === "session");

    // Use a unique ID to avoid conflicts
    const uniqueId = `e2e-sync-${Date.now()}`;

    const res = await request.post("/api/attempts/sync", {
      headers: { Cookie: `session=${sessionCookie?.value}` },
      data: {
        id: uniqueId,
        challengeSetId: "cs-safety-principles",
        answers: {},
      },
    });
    expect([200, 201]).toContain(res.status());
    const data = await res.json();
    expect(data).toHaveProperty("synced", true);
  });

  test("API POST /api/attempts/sync is idempotent", async ({ request, page }) => {
    await loginAsCandidate(page);
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === "session");

    const uniqueId = `e2e-idempotent-${Date.now()}`;
    const payload = {
      id: uniqueId,
      challengeSetId: "cs-safety-principles",
      answers: {},
    };
    const headers = { Cookie: `session=${sessionCookie?.value}` };

    const res1 = await request.post("/api/attempts/sync", { headers, data: payload });
    const res2 = await request.post("/api/attempts/sync", { headers, data: payload });

    expect([200, 201]).toContain(res1.status());
    expect([200, 201]).toContain(res2.status());

    const data1 = await res1.json();
    const data2 = await res2.json();
    expect(data1.attempt.idempotencyKey).toBe(uniqueId);
    expect(data2.attempt.idempotencyKey).toBe(uniqueId);
  });

  test("offline indicator is not visible when online", async ({ page }) => {
    await page.goto("/dashboard");
    const indicator = page.getByText("Offline — answers saved locally");
    await expect(indicator).toHaveCount(0);
  });
});
