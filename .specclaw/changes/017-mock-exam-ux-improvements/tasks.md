# Tasks: Mock Exam UX Improvements

**Change:** 017-mock-exam-ux-improvements
**Created:** 2026-08-27
**Total Tasks:** 4

## Summary

4 tasks across 3 waves. Wave 1 does the two independent, non-conflicting pieces (API cap + standalone minimap component) in parallel. Wave 2 wires everything into `MockExamClient.tsx` as a single task to avoid two agents editing the same file concurrently. Wave 3 adds e2e coverage once the real UI exists to test against.

## Tasks

### Wave 1 — Independent building blocks

- [x] `T1` — Cap mock exam question pool at 60
  - Files: `app/app/api/mock-exams/start/route.ts`
  - Estimate: small
  - Kind: impl
  - Notes: After `const shuffled = shuffle(questions);`, slice to `shuffled.slice(0, 60)` before use. Preserve existing behavior when pool ≤ 60 (slice is a no-op). Satisfies FR4, AC1, AC2.

- [x] `T2` — Create ExamMinimap presentational component
  - Files: `app/components/ExamMinimap.tsx` (new)
  - Estimate: medium
  - Kind: impl
  - Notes: Controlled component, no internal state. Props: `questions` (array with `id`), `currentIndex: number`, `answers: Record<string, string>`, `markedForReview: Set<string>` (or `string[]`), `onJump: (index: number) => void`. Render as `hidden md:grid` grid of numbered cells (1-indexed), color-coded: unanswered (neutral), answered (violet, matches existing palette in `MockExamClient.tsx`), marked-for-review (amber/yellow), answered+marked (combined indicator, e.g. violet fill with amber ring). Current question gets a distinct outline. Click a cell → `onJump(index)`. Satisfies FR7, FR8, FR9.

### Wave 2 — Integration

- [x] `T3` — Wire per-question timer, mark-for-review, jump nav, and minimap into MockExamClient
  - Files: `app/components/MockExamClient.tsx`
  - Estimate: medium
  - Kind: impl
  - Depends: `T2`
  - Notes:
    - Per-question timer: new `questionSeconds` state; `useEffect` resets it to 0 whenever `currentIndex` changes; extend (or add a second) 1s interval — active only while `phase === "running"` — to increment it. Compute `questionTimerWarning = questionSeconds >= 120` and apply the same red/pulse styling pattern already used for `timerWarning` (see `MockExamClient.tsx:184-190`). Display near the existing global timer. Satisfies FR1, FR2, FR3, AC3, AC4, AC5.
    - Mark-for-review: new `markedForReview` state (`Set<string>` of question IDs, or an equivalent `Record<string, boolean>`). Add a "Mark for review" toggle button near the existing Previous/Next controls that flips membership for `question.id`. Satisfies FR5, AC6.
    - Jump navigation: add a `goToQuestion(index: number)` helper that sets `currentIndex` (clamped to valid range); use it from Previous, Next, and the minimap's `onJump`. This keeps the per-question timer reset (which is keyed on `currentIndex`) correct for all three entry points. Satisfies FR6.
    - Mount `<ExamMinimap />` passing `questions`, `currentIndex`, `answers`, `markedForReview`, and `goToQuestion` as `onJump`. Widen the desktop layout (e.g. `md:max-w-6xl` outer container with `md:flex md:gap-6`, question column keeping its current `max-w-3xl` sizing) so the minimap has room alongside the question card without disturbing the mobile layout. Satisfies FR7, FR8, FR9, AC7, AC8, AC9.
    - Do not add `markedForReview` (or per-question timings) to the `submitExam` payload — confirm the `fetch("/api/mock-exams/submit", ...)` body is unchanged. Satisfies FR10, NFR3, AC10.

### Wave 3 — Verification

- [x] `T4` — e2e coverage for mock exam UX improvements
  - Files: `app/e2e/21-mock-exam-ux-improvements.spec.ts` (new)
  - Estimate: medium
  - Kind: test
  - Depends: `T1`, `T3`
  - Notes: New spec file — do not edit `app/e2e/04-mock-exam.spec.ts`. Cover:
    - `/api/mock-exams/start` returns ≤60 questions (AC1/AC2) — pick an exam known to have a pool >60 if one exists post-seed, else assert `questions.length <= 60` generically.
    - Per-question timer is visible and shows `00:00` on the first question (AC3).
    - Per-question timer resets on navigation — use `page.clock` to fast-forward a few seconds, navigate Next, assert the display is back near `00:00` (AC5). Use Playwright clock mocking (`page.clock.install()` + `fastForward`) rather than a real-time wait for the 2-minute warning state (AC4), per the design doc's flakiness mitigation.
    - Mark for review toggles and reflects in the minimap; clicking a minimap cell jumps to that question with prior answer preserved (AC6, AC9).
    - At a desktop viewport the minimap is visible with distinguishable statuses (AC7); at a mobile viewport (`page.setViewportSize` below 768px width) the minimap is absent and Previous/Next still works (AC8).
    - Full submit flow still redirects to the review page (AC10) — reuse the existing loop pattern from `04-mock-exam.spec.ts`.

---

## Legend

- `[ ]` Pending
- `[~]` In Progress
- `[x]` Complete
- `[!]` Failed
