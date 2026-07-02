# Spec: Study Plans — Structured Learning Paths

**Change:** 15-study-plans
**Created:** 2026-07-02
**Status:** 🟡 Draft

## Overview

Add per-exam study plan templates that sequence existing challenge sets and a mock-score goal into an ordered, day-paced checklist. Candidates enroll in a plan and see a timeline with auto-derived completion (from existing `Attempt` / `MockAttempt` data), a completion %, and a "next recommended action." Admins CRUD plan templates and their steps. Purely additive — a view/ordering layer over data already stored; no existing attempt or readiness logic changes.

## Requirements

### Functional Requirements

- **FR1** — Data model: `StudyPlan` (belongs to one `Exam`; title, description), `StudyPlanStep` (belongs to a plan; `order` int, `title`, `type` enum `CHALLENGE_SET | MOCK_SCORE`, `challengeSetId?` for CHALLENGE_SET steps, `mockScoreThreshold?` int for MOCK_SCORE steps, `dayOffset` int), `StudyPlanEnrollment` (user ↔ plan, unique per pair, `startedAt`).
- **FR2** — Seed: one `StudyPlan` for the Claude Architect exam with steps covering its existing challenge sets in order plus a final `MOCK_SCORE ≥ passingScore` step.
- **FR3** — `GET /api/study-plans` (candidate): returns all plans (with exam name + step count) and, for the current user, which are enrolled.
- **FR4** — `POST /api/study-plans/[id]/enroll` (candidate): creates enrollment for current user; idempotent (re-enroll returns existing, no duplicate). 404 if plan missing.
- **FR5** — `GET /api/study-plans/[id]/progress` (candidate): returns plan + steps with per-step `completed` boolean (auto-derived), `completedCount / totalSteps`, `completionPct`, and `nextStep` (first incomplete step in order, or null).
  - CHALLENGE_SET step complete ⟺ user has ≥1 `Attempt` on that challenge set with `score/total ≥ 0.5` (passing = ≥50%).
  - MOCK_SCORE step complete ⟺ user has ≥1 `MockAttempt` on the plan's exam with `score/total*100 ≥ mockScoreThreshold`.
- **FR6** — `/study-plans` page (candidate): lists plans as cards; enrolled plans show a "Continue" link + completion %, others show "Start plan" (enroll then go to detail).
- **FR7** — `/study-plans/[id]` page (candidate): timeline of steps grouped by week (`floor(dayOffset/7)+1`), each step showing complete/incomplete state, and a deep link into the challenge (`/challenges/[challengeSetId]`) or mock (`/mock-exam?examId=...`) flow. Shows completion % and highlights the next recommended action. Redirects to `/login` if unauthenticated.
- **FR8** — Admin CRUD at `/admin/study-plans`: list plans, create/edit/delete a plan (title, description, exam), and manage its steps (add/edit/delete/reorder via order field). API under `/api/admin/study-plans` guarded by `requireAdmin` (403 non-admin), mirroring existing admin route pattern.
- **FR9** — Nav: add "🗺️ Study Plans" link to admin sidebar and a Study Plans entry card on the candidate dashboard.

### Non-Functional Requirements

- **NFR1** — Follow existing patterns: `getSession`/`requireAdmin` guards, `@/lib/prisma`, App Router route handlers, Tailwind cartoony card UI matching existing pages.
- **NFR2** — Mobile-first responsive (consistent with dashboard/exams).
- **NFR3** — Progress derivation is read-only; no writes to Attempt/MockAttempt. No N+1: fetch user's attempts/mocks once and compute in memory.
- **NFR4** — `onDelete: Cascade` from Exam→StudyPlan→StudyPlanStep and User→Enrollment, matching existing cascade conventions.

## Acceptance Criteria

- **AC1** — `npx prisma migrate` applies cleanly; new models + `StudyPlanStepType` enum exist.
- **AC2** — Seed run creates ≥1 study plan for Claude Architect with ordered steps + a final mock-score step; re-running seed is idempotent (upsert).
- **AC3** — Candidate can visit `/study-plans`, start a plan, land on the detail page, and see steps.
- **AC4** — Completing a challenge set (existing flow) flips its step to complete on next `/study-plans/[id]/progress` load; hitting the mock threshold flips the mock step.
- **AC5** — `nextStep` returns the first incomplete step; when all complete, completionPct = 100 and nextStep is null.
- **AC6** — Non-admin gets 403 from `/api/admin/study-plans`; admin can create a plan, add steps, and see them reflected on the candidate side.
- **AC7** — `npm run lint` and `npm run build` pass; e2e suite green.

## Edge Cases

- Plan with zero steps → completionPct = 0 (guard divide-by-zero), nextStep null.
- CHALLENGE_SET step whose `challengeSetId` references a deleted set → treat as incomplete, do not crash (skip/guard null relation).
- User enrolled but never attempted anything → 0% , nextStep = first step.
- Duplicate enroll POST → returns existing enrollment, 200 (not 201, not error).
- MOCK_SCORE step with null threshold → default to exam.passingScore.

## Dependencies

- Existing models: `Exam`, `ChallengeSet`, `Attempt`, `MockAttempt`, `User`.
- Existing routes for deep links: `/challenges/[id]`, `/mock-exam`.
- Slices 01–05 (already merged).

## Notes

- Open questions from proposal resolved: (1) deep-link into flows — yes; (2) dayOffset int grouped into weeks in UI; (3) self-contained under `/study-plans` with a dashboard card link (no change to readiness card).
- Passing threshold for CHALLENGE_SET completion set to 50% to match the "half-ready"/first-attempt spirit; admins control MOCK_SCORE thresholds explicitly.
