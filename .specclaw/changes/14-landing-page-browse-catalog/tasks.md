# Tasks: Landing Page — Browse Exam Catalog

> **For Hermes:** Build wave-by-wave per specclaw lifecycle. Each task = 2-5 min. TDD where tests exist; commit at end of each task.

**Goal:** Replace `/` boilerplate with public exam catalog. Keep `/exams` functional. DRY via `components/ExamCatalog.tsx`.

**Architecture:** Extract Server Component `components/ExamCatalog.tsx` with `{ exams, auth }` props. Both `/` and `/exams` import it.

**Tech Stack:** Next.js 14 (App Router, Server Components) + TypeScript + Tailwind + Prisma + Playwright.

**Reference docs:**
- Spec: `.specclaw/changes/14-landing-page-browse-catalog/spec.md`
- Design: `.specclaw/changes/14-landing-page-browse-catalog/design.md`

---

## Wave 1 — Foundation (extract shared component)

### Task 1: Create the shared `ExamCatalog` Server Component

**Objective:** Move the catalog UI out of `/exams` into a reusable Server Component.

**Files:**
- Create: `app/components/ExamCatalog.tsx`

**Step 1: Write the file**

Copy from `.specclaw/changes/14-landing-page-browse-catalog/design.md` → Component Shape section, the entire `ExamCatalog` component (with `Exam` type + `AuthMode` discriminated union + function body). Exact 65-line file.

**Step 2: Verify TypeScript**

Run: `cd app && npx tsc --noEmit 2>&1 | grep -E "ExamCatalog|components/" | head -20`
Expected: empty output (no errors in `components/ExamCatalog.tsx`).

**Step 3: Commit**

```bash
cd app
git add components/ExamCatalog.tsx
git commit -m "feat(14): extract ExamCatalog shared server component"
```

---

## Wave 2 — Refactor `/exams` to use shared component (no behavior change)

### Task 2: Refactor `/exams/page.tsx`

**Objective:** Replace the inline catalog JSX with `<ExamCatalog exams={...} auth={...} />`. Behavior must be identical to the previous version.

**Files:**
- Modify: `app/app/exams/page.tsx`

**Step 1: Replace the file contents**

Use the exact code shown in design.md → "Page Refactors" → "`app/app/exams/page.tsx` (modified)".

**Step 2: Verify TypeScript + build**

Run: `cd app && npx tsc --noEmit 2>&1 | grep -E "exams/page" | head -20`
Expected: empty output.

Run: `cd app && npm run build 2>&1 | grep -E "Compiled|Error" | head -5`
Expected: `Compiled successfully` (or no errors). The new `.next/server/app/app/page.js` is acceptable; that comes in task 3.

**Step 3: Run existing `/exams` Playwright tests (no new tests yet — they should still pass)**

Run: `cd app && npx playwright test e2e/ --grep -i "exams" 2>&1 | tail -20`
Expected: existing exam tests still pass. (If there are no exam-specific tests, run the full suite and confirm no regressions vs baseline.)

**Step 4: Commit**

```bash
cd app
git add app/exams/page.tsx
git commit -m "refactor(14): route /exams through shared ExamCatalog component"
```

---

## Wave 3 — Replace `/` boilerplate with catalog

### Task 3: Rewrite `app/app/page.tsx`

**Objective:** Replace the default Next.js splash with the catalog for both anonymous + logged-in visitors.

**Files:**
- Modify: `app/app/page.tsx`

**Step 1: Replace the file contents**

Use the exact code shown in design.md → "Page Refactors" → "`app/app/page.tsx` (was: boilerplate)".

**Step 2: Verify TypeScript + build**

Run: `cd app && npx tsc --noEmit 2>&1 | grep -E "app/page" | head -20`
Expected: empty output.

Run: `cd app && npm run build 2>&1 | grep -iE "error|warning" | head -10`
Expected: no errors. (Tailwind warnings about unknown utilities are fine.)

Run: `cd app && ls .next/server/app/app/`
Expected: `page.js` exists (compiled from new `app/app/page.tsx`).

**Step 3: Spot-check the rendered HTML locally**

Run: `cd app && npm run dev &
SERVER_PID=$!
sleep 6
curl -s http://localhost:3000/ | grep -E "Exam Catalog|Claude Architect|AWS Solutions" | head -5
kill $SERVER_PID`
Expected: at least 2 lines of output containing "Exam Catalog" and at least one real exam name from the seeded data.

**Step 4: Commit**

```bash
cd app
git add app/page.tsx
git commit -m "feat(14): serve public exam catalog at root /"
```

---

## Wave 4 — E2E coverage

### Task 4: Create `e2e/landing.spec.ts`

**Objective:** Three Playwright specs covering the acceptance criteria.

**Files:**
- Create: `app/e2e/landing.spec.ts`

**Step 1: Write the file**

```ts
import { test, expect } from "@playwright/test";

test.describe("Landing page — public exam catalog", () => {
  test("anonymous visitor sees exam catalog at /", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Exam Ready/);
    await expect(page.getByRole("heading", { name: /Exam Catalog/ })).toBeVisible();

    // Real seeded exam names from app/prisma/seed.ts — adjust if seed changes.
    const cards = page.getByTestId("exam-card");
    await expect(cards.first()).toBeVisible();
    // At minimum, one of these exams must render (depends on which got seeded):
    const names = await cards.allInnerTexts();
    expect(names.length).toBeGreaterThan(0);
  });

  test("/ shows Sign in + Register CTAs for anonymous", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /^Sign in$/ }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /^Register$/ }).first()).toBeVisible();
  });

  test("logged-in user sees Dashboard link instead of Sign in", async ({ page }) => {
    // Pre-seed: app/prisma/seed.ts creates candidate@bistecglobal.com / candidate123!
    await page.goto("/login");
    await page.getByLabel("Email").fill("candidate@bistecglobal.com");
    await page.getByLabel("Password").fill("candidate123!");
    await page.getByRole("button", { name: /Sign In/i }).click();
    await page.waitForURL(/\/dashboard/);
    await page.goto("/");
    await expect(page.getByRole("link", { name: /Dashboard/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Sign in$/ })).toHaveCount(0);
  });
});
```

**Step 2: Run the new tests in isolation**

Run: `cd app && npx playwright test e2e/landing.spec.ts 2>&1 | tail -25`
Expected: `3 passed`.

If `candidate@bistecglobal.com` / `Candidate123` doesn't match the seeded users, inspect `app/prisma/seed.ts` for the actual credentials and adjust task 4 Step 1.

**Step 3: Run the full Playwright suite to confirm no regressions**

Run: `cd app && npx playwright test 2>&1 | tail -10`
Expected: all tests pass (or one unrelated flake re-run); zero regressions vs baseline from before this change.

**Step 4: Commit**

```bash
cd app
git add e2e/landing.spec.ts
git commit -m "test(14): e2e for public catalog at root"
```

---

## Wave 5 — Docs / backlog

### Task 5: Add row 14 to BACKLOG.md

**Objective:** Track change 14 in the priority table so future specclaw audits see it's done.

**Files:**
- Modify: `BACKLOG.md`

**Step 1: Add row**

In the table (immediately after row 13), insert:

```
| 14 | [Landing Page — Browse Exam Catalog](.specclaw/changes/14-landing-page-browse-catalog/proposal.md) | 🟠 P1 | ⏳ In Progress | 01, 03 |
```

And under "P1 — Launch completers", add a feature summary entry:

```
**14 · Landing Page — Browse Exam Catalog**
- Public `/` route serves the exam catalog (anonymous visitors see all 4 exams)
- `/exams` remains the logged-in equivalent (keeps Dashboard back-link)
- Shared `components/ExamCatalog.tsx` keeps both routes DRY
- "Sign in" / "Register" CTAs in top-right header for anonymous visitors
- Action buttons (clicking exam cards) redirect to `/login` for anonymous users
```

**Step 2: Commit**

```bash
cd app
git add BACKLOG.md
git commit -m "docs(14): add row 14 to BACKLOG priority table"
```

---

## Wave 6 — Status + verify report

### Task 6: Bump status.md phase to Build (in progress)

**Objective:** Reflect the specclaw lifecycle phase in status.md.

**Files:**
- Modify: `.specclaw/changes/14-landing-page-browse-catalog/status.md`

**Step 1: Update phases**

Change `Proposal 🟡 Draft` → `Proposal ✅ Approved`. Set `Spec ⏳ Pending` → `Spec ✅ Complete`. Set `Design ⏳ Pending` → `Design ✅ Complete`. Set `Tasks ⏳ Pending` → `Tasks ✅ Complete`. Set `Build ⏳ Pending` → `Build 🟡 In Progress`.

**Step 2: Commit**

```bash
cd app
git add .specclaw/changes/14-landing-page-browse-catalog/status.md
git commit -m "docs(14): update status — proposal/spec/design/tasks complete"
```

(Note: build/verify phase bumps happen after tasks 1-5 are committed and PR is opened.)

---

## Done Checklist

- [ ] Task 1: `components/ExamCatalog.tsx` created
- [ ] Task 2: `/exams/page.tsx` uses shared component; existing tests pass
- [ ] Task 3: `/` rewritten; serves catalog anonymously + logged-in
- [ ] Task 4: `e2e/landing.spec.ts` created; 3 tests pass; full suite green
- [ ] Task 5: BACKLOG row 14 added
- [ ] Task 6: status.md updated
- [ ] Final: `npm run build` exits 0; `npm run lint` exits 0
- [ ] Final: feature branch pushed; PR opened via `/specclaw:pr`
- [ ] Final: PR merged → cron auto-deploys within 1 hour → live at `practice.tecbizsolutions.com/`
