# Verification Report: 017-mock-exam-ux-improvements

**Verified:** 2026-08-27
**Model:** claude-sonnet-4-5
**Verdict:** PASS

## Acceptance Criteria

**AC1:** For an exam whose pool has more than 60 questions, `POST /api/mock-exams/start` returns exactly 60 questions.

Quotes: spec — "returns exactly 60 questions." Code — `app/app/api/mock-exams/start/route.ts:31`: `const shuffled = shuffle(questions).slice(0, 60);`. `prisma/seed.ts` contains 177 occurrences of `"q-` question IDs for `claude-architect-v1` (well over 60, matching design.md's noted risk: "Claude Architect ... seeded with 100+ questions"). Test — `e2e/21-mock-exam-ux-improvements.spec.ts:14-28` asserts `data.questions.length).toBeLessThanOrEqual(60)` and `.toBeGreaterThan(0)` against this exact exam.
- PASS **AC1** — `.slice(0, 60)` caps output at 60; independently re-ran the test (`npx playwright test`), passed. Pool confirmed >60 via seed data, so the cap is actually exercised, not vacuously true.

**AC2:** For an exam whose pool has 60 or fewer questions, `POST /api/mock-exams/start` returns the full pool (length unchanged).

Quotes: `Array.prototype.slice(0, 60)` on an array shorter than 60 returns a shallow copy of the whole array (verified JS semantics) — no off-by-one risk. `prisma/seed.ts` seeds additional smaller exams via `additionalExams` loop (e.g. `durationMinutes: 65`, `durationMinutes: 60` entries distinct from the 90-min Claude Architect exam).
- PASS **AC2** — `slice(0, 60)` is safe for arrays of any length ≤ 60; no dedicated e2e test targets a small-pool exam directly, but the code path is identical to pre-existing behavior for the sub-60 case (`shuffle(questions)` unchanged, only the `.slice` is new and is a no-op for len ≤ 60).
  - Edge case: no test explicitly exercises a ≤60-question exam through this endpoint; verified by code inspection only (spec's edge case "pool size is exactly 60" is likewise untested empirically).

**AC3:** Per-question timer visible, starts at `00:00`, increments once per second.

Quotes: `MockExamClient.tsx:230`: `⏳ {formatTime(questionSeconds)}`; state init `useState(0)` at line 34; tick effect lines 84-92 `setInterval(() => setQuestionSeconds((prev) => prev + 1), 1000)`. Test `e2e/21-...spec.ts:30-43` asserts `⏳ 00:0\d` on load; test `:45-65` fast-forwards 5s and asserts `⏳ 00:0[4-6]`.
- PASS **AC3** — verified by direct re-run of both tests (passed).

**AC4:** After 2 minutes on the same question, the timer visually switches to warning style.

Quotes: `MockExamClient.tsx:150`: `const questionTimerWarning = questionSeconds >= 120;`; line 227: `questionTimerWarning ? "text-red-600 animate-pulse" : "text-violet-700"` — mirrors the existing global `timerWarning` pattern (`secondsLeft < 600` → same classes, line 234).
- PASS **AC4** — implementation is correct and matches the required 120s threshold and existing warning style pattern.
  - Edge case / gap: no e2e test actually exercises this. Grepped both spec files for `animate-pulse`, `text-red-600`, and `120` and found zero matches (only `fastForward(5000)` for a 5s check exists, not 120s). design.md proposed testing this with Playwright clock mocking but that specific assertion was never written. Untested-but-correct, not incorrect.

**AC5:** Navigating (Previous/Next/minimap) resets the per-question timer to `00:00` for the new question.

Quotes: `MockExamClient.tsx:79-81`: `useEffect(() => { setQuestionSeconds(0); }, [currentIndex]);` — reset is keyed purely on `currentIndex`, not on which navigation control changed it, so Previous/Next/minimap all funnel through the same reset. Test `e2e/21-...spec.ts:61-64` confirms reset via "Next" button.
- PASS **AC5** — code guarantees reset regardless of navigation source since all three paths ultimately call `goToQuestion` → `setCurrentIndex`.
  - Edge case: e2e coverage only directly demonstrates reset via "Next"; reset-via-minimap-jump and reset-via-"Previous" are not independently asserted with a timer check. Confirmed correct by code reasoning, not by a dedicated assertion for those two paths.

**AC6:** "Mark for review" toggles on/off; reflected in minimap.

Quotes: `MockExamClient.tsx:279-288` toggle button with `aria-label="mark-for-review-toggle"`; `ExamMinimap.tsx:26-32` color logic branches on `isMarked`. Test `e2e/21-...spec.ts:74-102` toggles and re-verifies text; test `:105-130` asserts `minimapCell2).toHaveClass(/bg-amber-100/)` after marking.
- PASS **AC6** — verified by re-run (passed).

**AC7:** Desktop minimap shows correct color/status for at least one question in each of: unanswered, answered, marked-for-review.

Quotes: Test `e2e/21-...spec.ts:105-130` asserts `minimapCell1).toHaveClass(/bg-violet-600/)` (answered) and `minimapCell2).toHaveClass(/bg-amber-100/)` (marked, unanswered). `ExamMinimap.tsx:25` default class `"border-gray-200 bg-gray-100 ..."` for unanswered/unmarked cells.
- PASS **AC7** — answered and marked-for-review states are explicitly asserted by the test; unanswered is the implicit default class applied to all other cells and was visually present in the same test run, but not asserted by a direct class check.
  - Edge case: no explicit assertion on the unanswered cell's class string — minor test-coverage gap, not a code defect.

**AC8:** Mobile viewport hides minimap; Previous/Next navigation unaffected.

Quotes: `ExamMinimap.tsx:19`: `className="hidden md:grid ..."`. Test `e2e/21-...spec.ts:132-154` sets `375x667` viewport, asserts `minimapCell1).not.toBeVisible()`, then exercises Next/Previous.
- PASS **AC8** — verified by re-run (passed). `hidden md:grid` is a pure CSS breakpoint (no JS media-query listener), so it degrades correctly on resize per design.md's stated rationale.

**AC9:** Clicking a minimap cell for question N jumps to N; previous answer for N still shown selected.

Quotes: Test `e2e/21-...spec.ts:67-103` answers Q1, jumps to Q3 then back to Q1 via minimap, asserts `selectedOption).toHaveText(firstOptionText)`.
- PASS **AC9** — verified by re-run (passed). `goToQuestion` (`MockExamClient.tsx:94-100`) only mutates `currentIndex`; `answers` state is untouched by navigation.

**AC10:** Submit still redirects to `/mock-exam/[examId]/review/[attemptId]`; submit body unaffected by mark-for-review state.

Quotes: `MockExamClient.tsx:44-47`: submit body is `JSON.stringify({ examId, answers: currentAnswers, startedAt: sat })` — no `markedForReview` field. `app/api/mock-exams/submit/route.ts:9`: `const { examId, answers, startedAt } = await request.json();` — server never reads or expects a mark-for-review field. Test `e2e/21-...spec.ts:156-182` marks Q1/Q3 for review then submits, asserts `toHaveURL(/\/mock-exam\/.*\/review\//)`.
- PASS **AC10** — verified by re-run (passed) and by reading both client submit call and server route — no mark-for-review data crosses the wire in either direction.

## Test Results

Independently re-built and re-ran the full evidence chain rather than trusting reported numbers at face value:
- `npm run build` (Next.js production build): **succeeded**, no errors, all routes including `/api/mock-exams/start`, `/mock-exam/[examId]`, `/mock-exam/[examId]/review/[attemptId]` compiled.
- `npx playwright test e2e/04-mock-exam.spec.ts e2e/21-mock-exam-ux-improvements.spec.ts`: **16/16 passed** across 3 consecutive runs (0 flaky) after a locator fix (see Issues below for the flake history). Runtime ~47-50s per run.
- `npx tsc --noEmit`: pre-existing errors only, all in e2e spec files' shared `loginAsCandidate` helper type pattern, present in unrelated unchanged spec files too — not introduced by this change. Zero tsc errors attributable to `ExamMinimap.tsx`, `MockExamClient.tsx`, or `mock-exams/start/route.ts`.

## Issues Found

1. **AC4 (2-minute warning) has no automated test** — design.md planned a Playwright clock-mocked test for the 120s warning threshold, but no test asserts `text-red-600`/`animate-pulse` on the per-question timer after 120s elapsed. Implementation code is correct; behavior is verified only by manual code reading, not CI. **Fix:** add a test using `page.clock.fastForward(120_000)` asserting the warning class appears, mirroring the existing 5s reset test pattern.
2. **AC7 unanswered-state minimap color not explicitly asserted** — low severity, default branch is trivially correct. **Fix (optional):** add a class assertion on an untouched minimap cell.
3. **(Resolved during verify, not a residual issue)** A flaky e2e test was found and fixed before this report: `getByRole("button", { name: /for review/i })` could ambiguously match a randomized answer option's text. Fixed with a stable `aria-label="mark-for-review-toggle"` on the button and `getByLabel` in the tests. Confirmed stable across 3 repeat runs post-fix. Logged as learning L5.

## Summary

**Passed:** 10/10 criteria
**Failed:** 0/10 criteria
**Verdict:** PASS
