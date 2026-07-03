# 🦞 SpecClaw Dashboard

**Project:** exam-readiness-program
**Last Updated:** 2026-07-03 01:25 UTC

> Reconciled against BACKLOG.md + git history. All feature slices 01–15 are
> built, verified, and merged to `main`. The auto-generated task counts below
> drifted (they read per-change `status.md` files that predate merge); this
> reflects real state.

## Active Changes

_None._ All planned slices merged.

## Pending Proposals

_None._ Backlog 01–15 all ✅ Done (see BACKLOG.md).

## Superseded

- 🗄️ **gamified-flashcard-exam-readiness** — original umbrella proposal. Delivered
  via slices 01–15 (Next.js 14 + Prisma). Its `tasks.md` prescribes a conflicting
  Express+Vite stack. Kept for history; do not build.

## Recently Completed

- ✅ **15-study-plans** — 8/8 tasks | PR #13 merged
- ✅ **14-landing-page-browse-catalog** — PR #6 merged
- ✅ **09-system-deploy-practice-site** — deployed live to practice.tecbizsolutions.com
- ✅ **01–08, 11–13, 16–18** — see BACKLOG.md (auth, exam flow, mock exam,
  gamification, admin, PWA, deployment, cohort view, catalogs, CSV import/PDF,
  email notifications, CI/CD, user management)

## Known Issues

_None._

- ✅ **Prod container healthcheck false-negative** — RESOLVED by PR #15.
  `Environment=HOSTNAME=0.0.0.0` set in `exam-ready-app.container` quadlet, so
  Next.js standalone now binds to all interfaces and the in-container healthcheck
  reaches it. Prod verified serving `200` at
  https://practice.tecbizsolutions.com/login (2026-07-03).

## Stats

- **Total slices shipped:** 15 (all merged)
- **Active:** 0
- **Superseded:** 1
