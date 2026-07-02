# Proposal: Study Plans — Structured Learning Paths

**Created:** 2026-07-02
**Status:** 🟡 Draft

## Problem

Study Plans is a core CLAUDE.md feature ("Structured learning paths per certification with daily/weekly targets") that was never built. Candidates currently see a flat catalog of challenge sets and mock exams with no guided sequence, no sense of "what should I do next," and no daily/weekly pacing. Motivated learners self-organize; everyone else stalls. All progress/readiness data already exists — it just isn't tied to a plan.

## Proposed Solution

Add per-exam **study plan templates** (ordered modules → mapped to existing challenge sets + a mock-score target), which candidates **enroll** in and work through as a tracked checklist/timeline.

- **Admin** defines/edits a plan template per exam: ordered steps, each step is a task (complete challenge set X, or score ≥ N% on a mock), with a recommended day/week offset.
- **Candidate** enrolls in a plan, sees a timeline/checklist of steps, a completion %, and a **"next recommended action"** derived from existing `Attempt` / `MockAttempt` data.
- Step completion is **auto-derived** from existing attempt data (no manual check-off) — a "complete challenge set X" step goes green once the candidate has a passing attempt; a "score ≥ N% mock" step completes when a `MockAttempt` meets the threshold.
- Reuses existing readiness/progress computations — the plan is a view + ordering layer over data we already store.

## Scope

### In Scope
- Prisma models: `StudyPlan` (per exam, template), `StudyPlanStep` (ordered, typed: CHALLENGE_SET | MOCK_SCORE, target ref/threshold, day offset), `StudyPlanEnrollment` (user ↔ plan, started date).
- Migration + seed one study plan for the Claude Architect exam.
- Candidate routes: `/study-plans` (list enrollable plans + enrolled), `/study-plans/[id]` (timeline, completion %, next action).
- API: `GET /api/study-plans`, `POST /api/study-plans/[id]/enroll`, `GET /api/study-plans/[id]/progress` (auto-derived completion).
- Admin: `/admin/study-plans` CRUD for plan templates + steps.
- Step completion auto-derived from `Attempt` / `MockAttempt`.

### Out of Scope
- Calendar integrations / reminders (email weekly summary already exists separately).
- Reordering via drag-and-drop UI (simple order-index field is enough for MVP).
- Multiple concurrent plans per exam per user (one enrollment per plan).
- Adaptive/AI-generated plans — templates are admin-authored.

## Impact

- **Files affected:** ~14 (estimated) — schema + migration + seed, 3 candidate route files, 3 API routes, admin CRUD page + API, a `StudyPlanTimeline` component, nav link.
- **Complexity:** medium
- **Risk:** low — additive; new tables, no changes to existing attempt/readiness logic (read-only consumers).

## Open Questions

1. Should the "next recommended action" link straight into the challenge/mock flow? (Assume yes — deep link.)
2. Day offsets: absolute (day 1, 2, 3…) or grouped by week? (Assume day offset integer, grouped into weeks in the UI.)
3. Show plan progress on the main dashboard readiness card, or keep it self-contained under `/study-plans`? (Assume self-contained for MVP, with a dashboard link.)

---

**To proceed:** Review this proposal and approve to begin planning.
