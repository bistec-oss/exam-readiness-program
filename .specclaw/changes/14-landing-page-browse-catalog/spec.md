# Spec: Landing Page — Browse Exam Catalog

**Change:** 14-landing-page-browse-catalog
**Phase:** Spec
**Created:** 2026-06-29

## Goal

Replace the default `create-next-app` boilerplate at `/` with a public-facing exam catalog so first-time visitors see the platform's value proposition instead of "blank Next.js project". Preserve the existing logged-in `/exams` route as-is.

## Acceptance Criteria

1. **`GET /` returns 200** for anonymous (unauthenticated) requests.
2. **`/` shows the full exam catalog** — every row in `prisma.exam.findMany()`, rendered with the same pastel/violet card UI as the existing `/exams` page (✓ pass %, ⏱ duration, 📚 challenge sets count, ❓ questions count).
3. **`/` shows a "Sign in" CTA** in the top-right when anonymous, linking to `/login`. A "Register" link is also visible.
4. **`/` does NOT redirect to `/login`.** No session check at the top of the page.
5. **Logged-in users on `/` see the same catalog** with a "Dashboard" back-link instead of "Sign in / Register" (mirrors `/exams` behavior).
6. **`/exams` keeps its existing behavior unchanged** — auth-gated, redirects to `/login` if anonymous, shows catalog if logged-in. The catalog content is identical to `/` (single source of truth — `components/ExamCatalog.tsx`).
7. **No change to other routes**: `/exams/[id]`, `/dashboard`, `/login`, `/register`, `/admin/*`, `/leaderboard`, `/settings`, `/mock-exam`, `/challenges/[id]/play` all work as before. Anonymous user clicks any exam card → goes to `/exams/[id]` → redirects to `/login`. (This flow existed pre-change for `/exams`.)
8. **Build is green:** `npm run build` succeeds; both routes appear in `.next/server/app/app/`.
9. **Live URL `https://practice.tecbizsolutions.com/`** shows catalog (verify via curl after deploy — `<title>` should still be "Exam Ready! | Bistec Global", `<body>` should contain "Exam Catalog" + an exam name like "Claude Architect").

## Out of Scope (per proposal)

- Marketing hero, screenshots, social proof
- Search/filter/sort the catalog
- SEO meta tags, Open Graph, sitemap.xml
- Custom 404 / error pages
- Per-exam `displayPublicly` flag (no schema change)
- Extracting other shared components

## Test Strategy

Per the specclaw lifecycle, E2E tests must pass before `/specclaw:verify`. The repo has Playwright (`playwright.config.ts`, `e2e/`):

- **New `e2e/landing.spec.ts`:**
  - `test("anonymous visitor sees exam catalog on /")` — visits `/`, asserts visible exam names ("Claude Architect", "AWS Solutions Architect" or current canonical names from seeded data)
  - `test("/ shows Sign in CTA for anonymous")` — visits `/`, asserts visible "Sign in" link to `/login`
  - `test("logged-in user sees dashboard link instead of Sign in")` — logs in via form, visits `/`, asserts "Dashboard" link visible
- **Existing E2E (`e2e/`) must still pass** — particularly:
  - Catalog flow tests (change 03)
  - Mock exam tests (change 04)
  - Dashboard tests (change 05)
  - Admin tests (change 06)
- **No new unit tests** — Next.js server components are covered by E2E; no `__tests__/` or `*.test.ts` exists in this repo.

## Verification

Per `/specclaw:verify`:

1. `npm run build` — exit 0
2. `npm run lint` — exit 0 (existing eslint config)
3. `npx playwright test e2e/` — all green, including the 3 new specs above
4. `curl -s https://practice.tecbizsolutions.com/ | grep -c "Exam Catalog"` — returns ≥ 1
5. `curl -s -o /dev/null -w "%{http_code}" https://practice.tecbizsolutions.com/` — returns 200
