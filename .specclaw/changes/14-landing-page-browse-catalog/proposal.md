# Proposal: Landing Page — Browse Exam Catalog

**Created:** 2026-06-29
**Status:** 🟡 Draft

## Problem

The root route (`/`) at `practice.tecbizsolutions.com` currently serves the **default `create-next-app` boilerplate** page — `app/app/page.tsx` was committed in `b747d1d` and never replaced. The page renders the literal "To get started, edit the page.tsx file" with Next.js branding and a Deploy Now link to vercel.com.

This is the **first impression for every new visitor and potential candidate** — they see "blank Next.js project" instead of the platform. Landing on `/login` (the only working entry point today) requires a manual URL edit or browser guess.

The actual exam catalog already exists at `/exams` (built in change 03) but it (a) requires authentication, (b) doesn't promote itself on the root. The platform's real shape — multi-cert catalog with gamified UI — is invisible without an account.

## Proposed Solution

Replace the boilerplate at `app/app/page.tsx` with a **public-facing exam catalog** that:

1. **Renders without authentication** — anonymous visitors see the full catalog (4 exams, 26 challenge sets, 147 questions), preserving the gamified pastel/violet design from `/exams`.
2. **Promotes sign-in / registration** when anonymous — "Sign in to track progress" / "Register" buttons at the top right and on each card.
3. **Mirrors `/exams` for logged-in users** — keep the dashboard back-link for users on the catalog (preserves muscle memory).
4. **Reuses the existing `prisma.exam.findMany` query** from `app/app/exams/page.tsx` — no new DB access path.

Then update `app/app/exams/page.tsx` to `redirect("/")` for unauthenticated users (so the catalog has one canonical URL, and the rest of the app's behavior stays unchanged for authenticated users).

## Scope

### In Scope

- `app/app/page.tsx` — replace boilerplate with public exam catalog (extracted shared component or inlined; see Design decision)
- `app/app/exams/page.tsx` — change auth redirect to `redirect("/")` so `/exams` and `/` are the same canonical page
- `BACKLOG.md` — add row 14 in priority table + feature summary, mark `01-09` existing rows as ✅ (already shown)
- Existing routes are untouched: `/login`, `/register`, `/dashboard`, `/admin`, `/leaderboard`, `/settings`, `/mock-exam`, `/challenges/[id]/play`

### Out of Scope

- Marketing/hero copy, screenshots, testimonials — keep layout identical to existing `/exams`, no new design language
- Search / filter / sort the exam list (YAGNI; can be a follow-up)
- SEO meta tags, Open Graph, sitemap.xml
- Per-exam analytics or "trending" CTAs
- `not-found.tsx` and error pages — current 404 inline is acceptable

## Impact

- **Files affected:** 2–3 (`app/app/page.tsx`, `app/app/exams/page.tsx`, `BACKLOG.md`) — possibly a new `components/ExamCatalog.tsx` extracted for DRY
- **Lines of code:** ~120 (refactor + extraction) or ~80 (no extraction)
- **Risk:** low — touch is concentrated in 2 pages; both have built production versions; Caddy/cloudflared don't care
- **Deploy impact:** zero — same image, same network, no env changes. Cron-based auto-rebuild (`exam-ready-auto-rebuild.sh`) will deploy after PR merge.

## Open Questions

1. **Should `/exams` still exist as a separate path, or should `/` redirect anonymous users to `/exams`?** Default plan: `/` IS the catalog, `/exams` redirects there for logged-in users (so bookmarks still work). Need operator decision.
2. **Should anonymous visitors see **all** exams including admin-only ones?** Default plan: yes — show all `prisma.exam.findMany()` results; gate actions (Start Practice, Take Mock Exam) by auth redirect rather than hiding exams. Keeps SEO/discoverability.
3. **Does `app/components/` exist, or do we inline?** Repo currently has no `components/` dir (verified). Decision needed before Design phase: inline both pages (`/`, `/exams`) for symmetry, or extract `components/ExamCatalog.tsx` shared by both.

---

**To proceed:** Approve to begin `/specclaw:plan`.
