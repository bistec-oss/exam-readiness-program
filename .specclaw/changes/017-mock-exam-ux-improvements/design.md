# Design: Mock Exam UX Improvements

**Change:** 017-mock-exam-ux-improvements
**Created:** 2026-08-27

## Technical Approach

All three features are additive changes to the existing client-rendered mock exam flow — no new routes, no schema, no new dependencies.

1. **60-question cap** — one-line change to `app/app/api/mock-exams/start/route.ts`: slice the already-shuffled question array to 60 before returning it.
2. **Per-question timer** — new local state in `MockExamClient.tsx` tracking elapsed seconds on the *current* question, driven by the same 1s interval pattern already used for the global countdown (`MockExamClient.tsx:61-70`), reset via a `useEffect` keyed on `currentIndex`.
3. **Skip / mark-for-review / minimap** — new local state (`Set<string>` of question IDs marked for review) plus a `goToQuestion(index)` helper replacing the current inline `setCurrentIndex` calls. A new presentational component `ExamMinimap.tsx` renders the question palette, shown only at `md:` and above via Tailwind responsive classes (not JS viewport detection, so it degrades correctly on resize without extra listeners).

## Architecture

No architectural change — this stays entirely within the existing client-component + Next.js API route pattern already used by the mock exam feature. The only structural addition is one new presentational component (`ExamMinimap.tsx`) that `MockExamClient.tsx` owns and drives; it holds no state of its own (fully controlled via props).

```
MockExamClient.tsx (state owner)
 ├─ per-question timer state + effect
 ├─ markedForReview: Set<string>
 ├─ goToQuestion(index) — replaces raw setCurrentIndex in nav handlers
 └─ renders <ExamMinimap /> (md: and up only)
       ExamMinimap.tsx (controlled, presentational)
        ├─ props: questions, currentIndex, answers, markedForReview, onJump
        └─ one cell per question, color-coded, onClick → onJump(index)
```

## File Changes Map

| File | Action | Description |
|------|--------|-------------|
| `app/app/api/mock-exams/start/route.ts` | Modify | After `shuffle(questions)`, slice to the first 60 entries before returning; unchanged when pool ≤ 60 |
| `app/components/MockExamClient.tsx` | Modify | Add per-question timer state/effect, `markedForReview` state, `goToQuestion()` nav helper, "Mark for review" button, mount `ExamMinimap`, widen desktop layout to fit the sidebar/palette |
| `app/components/ExamMinimap.tsx` | Create | Desktop-only (`hidden md:grid`) question palette: grid of question numbers, color-coded by status, click-to-jump |
| `app/e2e/21-mock-exam-ux-improvements.spec.ts` | Create | e2e coverage: question cap at 60, per-question timer warning after 2min (using Playwright clock mocking, not a real 2-minute wait), mark-for-review toggle + minimap jump, mobile viewport hides minimap |

## Data Model Changes

None. No Prisma schema or migration changes — mark-for-review and per-question timer are transient client state, cleared when the exam session ends.

## API Changes

`POST /api/mock-exams/start` — response shape unchanged (`{ examId, startedAt, durationMinutes, questions }`); only the *length* of `questions` changes, capped at `min(60, pool size)`. No request shape change. `POST /api/mock-exams/submit` is untouched — mark-for-review state is never sent.

## Key Decisions

- **Hardcode the 60-cap** rather than adding a per-exam config field (resolves proposal open question 1) — no exam currently needs a different cap, and a config field would be speculative per the project's simplicity-first rule.
- **Minimap hidden via CSS breakpoint (`hidden md:grid`), not a JS `useMediaQuery` hook** — avoids a resize listener/extra state and degrades correctly if the window is resized mid-exam, satisfying FR9's "no lost state on resize" edge case for free.
- **Mark-for-review as a `Set<string>` of question IDs**, not persisted or sent on submit — matches the proposal's explicit Out-of-Scope decision and keeps the submit API contract stable (NFR3).
- **Per-question timer reset via `useEffect` on `currentIndex`**, mirroring the existing pattern for the global timer effect, rather than resetting inline at each of the three navigation call sites (Previous / Next / minimap jump) — keeps the reset logic in one place regardless of how `currentIndex` changes.
- **New component (`ExamMinimap.tsx`) instead of inlining the grid into `MockExamClient.tsx`** — the file is already ~260 lines; the minimap is a self-contained, fully-controlled render with its own click handling, a natural extraction point.

## Risks & Mitigations

- **Risk:** At least one existing exam (Claude Architect — seeded with 100+ questions across multiple sets) has a pool well over 60, so its mock exam will visibly shrink from "all questions" to 60 once this ships. **Mitigation:** this is the explicit intent of the proposal (mirroring real fixed-length certification exams); flag it in the verify report so it's a known, expected behavior change, not a regression.
- **Risk:** Widening the desktop layout to fit the minimap sidebar could visually clash with the just-shipped `max-w-6xl` flashcard width change (unrelated PR #20) if the two ever share a viewport pattern. **Mitigation:** mock exam and flashcard are separate routes/components; verify visually in isolation, no shared container.
- **Risk:** e2e test for the 2-minute per-question timer warning would be slow/flaky if it waited a real 2 minutes. **Mitigation:** use Playwright's clock mocking (`page.clock.install()` / `page.clock.fastForward()`) to advance time deterministically instead of a real-time wait.
- **Risk:** Existing `04-mock-exam.spec.ts` tests read total question count dynamically from the `Q 1 / N` header rather than hardcoding it, so they remain correct after the cap — confirmed by reading the existing spec; no update needed there.
