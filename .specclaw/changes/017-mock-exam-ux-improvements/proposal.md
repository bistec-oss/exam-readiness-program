# Proposal: Mock Exam UX Improvements

**Created:** 2026-08-27
**Status:** 🟡 Draft

## Problem

_What problem are we solving? Why does it matter?_

The full mock exam experience (`app/components/MockExamClient.tsx`) currently has three gaps versus real certification exam conditions:

1. There's no per-question pacing signal — trainees only see the overall exam countdown, so they can't tell if they're spending too long on any single question until the whole exam clock runs low.
2. `/api/mock-exams/start` pulls every question in the exam's pool and shuffles the full set. For exams with large pools this makes mock attempts inconsistent in length and doesn't mirror the fixed-length format of real certification exams (e.g. most vendor exams cap at 50-65 questions).
3. Navigation is strictly linear (Previous/Next only). Trainees can't skip a hard question and come back, mark it for review, or get an at-a-glance view of which questions are answered/skipped/flagged — a standard feature of real exam UIs (e.g. Pearson VUE, PSI navigators).

## Proposed Solution

_What are we building? High-level approach._

1. **Per-question timer**: track elapsed time on the *current* question client-side (reset on navigation), rendered next to the existing global timer. Turns red/pulsing once elapsed time on that question passes 2 minutes. Purely client-side state in `MockExamClient.tsx` — no new API or schema.
2. **Randomized 60-question cap**: change `/api/mock-exams/start/route.ts` to shuffle the full question pool then `.slice(0, 60)` (or the pool size if smaller). Exam duration/scoring logic already operates on whatever question set is returned, so no other backend change needed.
3. **Skip / mark-for-review + minimap**: add per-question status state (`unanswered` / `answered` / `marked-for-review`) in `MockExamClient.tsx`. Add a "Mark for review" button alongside existing navigation, and a desktop-only (`md:` breakpoint+) side/top palette grid showing all question numbers color-coded by status, clickable to jump directly to that question. Submit payload/schema unchanged — review-marked is UI-only bookkeeping, doesn't affect scoring.

## Scope

### In Scope
- `app/components/MockExamClient.tsx` — per-question timer, skip/mark-for-review state, jump navigation, desktop minimap component
- `app/app/api/mock-exams/start/route.ts` — cap shuffled question set at 60
- New/updated Playwright e2e coverage for: question cap size, mark-for-review + minimap jump, per-question timer color change

### Out of Scope
- Changes to `/api/mock-exams/submit` payload or scoring logic (review-marked status is not persisted server-side)
- Mobile minimap (desktop-only per request; mobile keeps existing Prev/Next flow)
- Per-question timer persistence across page reload (resets with exam session, same as current global timer behavior)
- Practice test / flashcard modes (`FlashCardPlayer.tsx`) — this proposal is scoped to the full Mock Exam flow only

## Impact

- **Files affected:** 2-3 (estimated) — `MockExamClient.tsx`, `start/route.ts`, plus e2e spec additions
- **Complexity:** medium (small/medium; the minimap + status tracking is the biggest piece, but all client-side with no schema changes)
- **Risk:** low

## Open Questions

- Should the 60-question cap be configurable per-exam (schema field) or hardcoded? Proposal assumes hardcoded 60 for now — flag if this should be a per-exam `durationMinutes`-style field instead.
- Should "marked for review" surface on the post-submit review page, or is it purely an in-exam navigation aid that disappears after submit?

---

**To proceed:** Review this proposal and approve to begin planning.
