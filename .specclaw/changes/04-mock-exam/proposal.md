# Proposal: Timed Full Mock Exam Mode

**Created:** 2026-06-29
**Status:** 🟡 Draft

## Problem

Candidates need to simulate real exam conditions — timed, all questions from the pool, no per-question feedback — to build exam-day stamina and identify true readiness level.

## Proposed Solution

Mock exam page fetches all questions for an exam (randomized). Server records `startedAt`. Countdown timer auto-submits on expiry. On submit, server validates time used. Results page shows all answers with correct/incorrect review. Score saved to `MockAttempt`; readiness % updated.

## Scope

### In Scope
- `POST /api/mock-exams/start` — server records startedAt, returns shuffled questions
- `POST /api/mock-exams/submit` — validates time, saves MockAttempt
- Mock exam page (`/mock-exam/[examId]`) — questions + countdown timer
- Auto-submit on timer expiry
- Post-exam review page (`/mock-exam/[examId]/review`) — all Q&A with feedback
- Mock exam history on dashboard (score, time used, date)
- Timer component (animated countdown, warning color at < 10min)

### Out of Scope
- Per-question feedback during exam (by design — review only after)
- Partial saves / resume (MVP scope)

## Impact

- **Files affected:** 8–10
- **Complexity:** medium
- **Risk:** low (server-side time validation prevents cheating)

## Open Questions

_None._

---

**To proceed:** Approve to begin planning.
