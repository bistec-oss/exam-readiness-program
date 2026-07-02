# 🦞 SpecClaw Dashboard

**Project:** exam-readiness-program
**Last Updated:** 2026-07-02 21:30 UTC

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

- ⚠️ **Prod container healthcheck false-negative** — `exam-ready-app` reports
  `unhealthy` (streak 1493) though the app serves 200 on :3015. Next.js standalone
  binds to `$HOSTNAME` (= container id), so the in-container healthcheck
  `wget http://127.0.0.1:3000/login` hits loopback where nothing listens. Fix:
  set `Environment=HOSTNAME=0.0.0.0` in `exam-ready-app.container` quadlet.

## Stats

- **Total slices shipped:** 15 (all merged)
- **Active:** 0
- **Superseded:** 1
