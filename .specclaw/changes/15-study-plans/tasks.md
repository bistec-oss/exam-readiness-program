# Tasks: Study Plans — Structured Learning Paths

**Change:** 15-study-plans
**Created:** 2026-07-02
**Total Tasks:** 8

## Summary

Additive feature: 3 Prisma models + enum, migration, seed, a shared completion-derivation helper, candidate read APIs + 2 pages, admin CRUD APIs + page, nav links, and an e2e flow. Ordered so data layer lands first, then the shared helper both API sides depend on, then UI, then verification.

## Tasks

### Wave 1 — Data layer

- [ ] `T1` — Schema + migration + seed
  - Files: `prisma/schema.prisma`, `prisma/migrations/*`, `prisma/seed.ts`
  - Estimate: medium
  - Notes: Add `StudyPlan`, `StudyPlanStep`, `StudyPlanEnrollment`, enum `StudyPlanStepType` + back-relations (Exam, ChallengeSet `SetNull`, User). Run `prisma migrate dev`. Seed one Claude Architect plan: ordered CHALLENGE_SET steps for its existing sets + final MOCK_SCORE step (threshold = exam.passingScore). Upsert-based (idempotent).

- [ ] `T2` — Completion-derivation helper
  - Files: `lib/studyPlan.ts`
  - Estimate: small
  - Depends: T1
  - Notes: `deriveProgress(plan, steps, attempts, mocks, exam)` → per-step `completed` (CHALLENGE_SET: passedSetIds.has(id) where score/total≥.5; MOCK_SCORE: bestMockPct ≥ threshold??passingScore), `week=floor(dayOffset/7)+1`, `completedCount`, `completionPct` (guard 0 steps), `nextStep`. Pure function, no prisma import.

### Wave 2 — APIs (depend on T1/T2)

- [ ] `T3` — Candidate APIs
  - Files: `app/api/study-plans/route.ts`, `app/api/study-plans/[id]/enroll/route.ts`, `app/api/study-plans/[id]/progress/route.ts`
  - Estimate: medium
  - Depends: T1, T2
  - Notes: `getSession` guard (401 unauth). GET list w/ enrolled flags; POST enroll idempotent (findFirst-or-create on unique [userId,planId], return 200); GET progress uses `deriveProgress` after single fetch of user attempts + exam mocks. Build deep-link per step (`/challenges/[id]` or `/mock-exam?examId=`).

- [ ] `T4` — Admin CRUD APIs
  - Files: `app/api/admin/study-plans/route.ts`, `app/api/admin/study-plans/[id]/route.ts`, `app/api/admin/study-plans/[id]/steps/route.ts`, `app/api/admin/study-plans/steps/[stepId]/route.ts`
  - Estimate: medium
  - Depends: T1
  - Notes: `requireAdmin` (403) per existing `/api/admin/exams` pattern. Plans GET/POST, plan GET/PATCH/DELETE, step POST (under plan), step PATCH/DELETE (by stepId).

### Wave 3 — UI (depends on APIs)

- [ ] `T5` — Candidate pages + timeline component
  - Files: `app/study-plans/page.tsx`, `app/study-plans/[id]/page.tsx`, `components/StudyPlanTimeline.tsx`
  - Estimate: medium
  - Depends: T3
  - Notes: List page (start/continue). Detail page redirects `/login` if no session, renders `StudyPlanTimeline` (client): weeks grouping, step complete/incomplete states, deep links, completion %, next-action highlight.

- [ ] `T6` — Admin study-plans page
  - Files: `app/admin/study-plans/page.tsx`
  - Estimate: medium
  - Depends: T4
  - Notes: Client CRUD UI matching existing admin pages — list plans, create/edit/delete plan, manage steps (add/edit/delete, order field).

- [ ] `T7` — Nav links
  - Files: `app/admin/layout.tsx`, `app/dashboard/page.tsx`
  - Estimate: small
  - Depends: T5, T6
  - Notes: Add "🗺️ Study Plans" to admin sidebar; add Study Plans card link on candidate dashboard.

### Wave 4 — Verify

- [ ] `T8` — E2E + full verify
  - Files: `e2e/study-plans.spec.ts`
  - Estimate: medium
  - Depends: T5, T7
  - Notes: E2E: login candidate → /study-plans → start plan → detail shows steps → complete a challenge set → step flips complete on reload. Reuse existing login helper + single server (avoid stale-3010 flake). Then `npm run lint`, `npm run build`, `npm run test:e2e` all green.

---

## Legend

- `[ ]` Pending
- `[~]` In Progress
- `[x]` Complete
- `[!]` Failed
