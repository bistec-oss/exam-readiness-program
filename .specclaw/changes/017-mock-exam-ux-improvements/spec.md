# Spec: Mock Exam UX Improvements

**Change:** 017-mock-exam-ux-improvements
**Created:** 2026-08-27
**Status:** 🟡 Draft

## Overview

Bring the Full Mock Exam flow (`app/components/MockExamClient.tsx`) closer to real certification exam conditions: per-question pacing feedback, a fixed-length randomized question set instead of the entire pool, and non-linear navigation (skip / mark-for-review / jump) with a desktop question palette. All changes are client-side plus a one-line cap in the exam-start API; no schema or submit-payload changes.

## Requirements

### Functional Requirements

- **FR1:** The exam screen displays a per-question elapsed-time indicator that starts at 0:00 when a question is first shown and counts up while that question is active.
- **FR2:** The per-question timer resets to 0:00 whenever the candidate navigates away from the current question (Previous, Next, or minimap jump) and re-shows for the newly active question.
- **FR3:** Once a question's elapsed time reaches 2:00 (120s), its timer switches to a visually distinct "warning" state (red text / pulse), matching the existing pattern used for the global exam timer's `timerWarning` state.
- **FR4:** `POST /api/mock-exams/start` returns at most 60 questions, randomly selected from the exam's question pool (existing `shuffle()` + new cap). If the pool has 60 or fewer questions, the full shuffled pool is returned unchanged (current behavior preserved).
- **FR5:** The candidate can toggle a "Mark for review" flag on the currently displayed question via a button in the exam UI.
- **FR6:** The candidate can navigate to any question directly (not just Previous/Next), leaving unanswered questions unanswered ("skip").
- **FR7:** On desktop viewports (Tailwind `md:` breakpoint, ≥768px), a question palette/minimap is shown, rendering one cell per question, color-coded by status: unanswered, answered, marked-for-review, and answered+marked-for-review.
- **FR8:** Clicking a cell in the minimap jumps directly to that question, preserving all previously entered answers and mark-for-review flags.
- **FR9:** The minimap is not rendered below the `md:` breakpoint; mobile/narrow viewports keep the existing Previous/Next-only navigation with no other regressions.
- **FR10:** Mark-for-review state is exam-session UI state only — it is not included in the payload sent to `POST /api/mock-exams/submit` and is not persisted server-side.

### Non-Functional Requirements

- **NFR1:** No new npm dependencies.
- **NFR2:** No Prisma schema or migration changes.
- **NFR3:** `POST /api/mock-exams/submit` request/response shape is unchanged from current behavior.
- **NFR4:** The per-question timer runs independently of the existing global countdown timer (`app/components/MockExamClient.tsx:58-73`); both remain accurate and neither blocks or resets the other.
- **NFR5:** All new interactive elements (mark-for-review button, minimap cells) are keyboard/click accessible consistent with existing button patterns in the file (no new a11y regressions).

## Acceptance Criteria

Each criterion must pass for the change to be considered complete.

- **AC1:** For an exam whose pool has more than 60 questions, `POST /api/mock-exams/start` returns exactly 60 questions.
- **AC2:** For an exam whose pool has 60 or fewer questions, `POST /api/mock-exams/start` returns the full pool (length unchanged from current behavior).
- **AC3:** On the running exam screen, a per-question timer is visible, starts at `00:00`, and increments once per second.
- **AC4:** After remaining on the same question for 2 minutes, the per-question timer visually switches to its warning style.
- **AC5:** Navigating to a different question (Previous, Next, or a minimap click) resets the per-question timer display to `00:00` for the newly shown question.
- **AC6:** Clicking "Mark for review" on a question toggles its marked state on and off; the toggle is reflected in the minimap.
- **AC7:** At desktop viewport width, the minimap is visible and shows the correct color/status for at least one question in each of: unanswered, answered, marked-for-review.
- **AC8:** At mobile viewport width (below `md:`), the minimap is not present in the DOM (or not visible), and Previous/Next navigation still works exactly as before this change.
- **AC9:** Clicking a minimap cell for question N jumps the visible question to N, and any answer previously given for N is still shown as selected.
- **AC10:** Submitting the exam (via the existing "Submit Exam" flow) still redirects to `/mock-exam/[examId]/review/[attemptId]` and the submit request body is unaffected by mark-for-review state (no new fields).

## Edge Cases

- Exam pool size is exactly 60 → all 60 are returned, no off-by-one error.
- Exam pool size is smaller than 60 (e.g. current 20-question exams) → unchanged, full pool returned, no crash from slicing past array bounds.
- Candidate marks the final question for review, then submits directly without revisiting other questions — submit must proceed normally.
- Candidate jumps via minimap to a question, then immediately jumps again before 1 second elapses — per-question timer must not throw or double-count; it just resets again.
- Browser window resized across the `md:` breakpoint mid-exam — minimap show/hide must follow CSS breakpoint, not lose in-memory answer/mark state.
- Exam auto-submits on global timer expiry while a question is marked for review and unanswered — existing auto-submit path (`MockExamClient.tsx:61-70`) must continue to work unmodified by the new state.

## Dependencies

- None new. Builds entirely on the existing mock-exam start/submit API and `MockExamClient.tsx` component; no other in-flight change in `.specclaw/changes/` is required first.

## Notes

- Resolves proposal open question 1: the 60-question cap is hardcoded (not a per-exam configurable field) — simplest option that satisfies the stated problem; can be revisited if a future exam needs a different cap.
- Resolves proposal open question 2: mark-for-review is in-exam-only bookkeeping and does not appear on the post-submit review page (per proposal's Out of Scope: "review-marked status is not persisted server-side").
- Existing e2e coverage lives in `app/e2e/04-mock-exam.spec.ts`; new coverage for this change should live in a new spec file rather than editing that one, to keep the original mock-exam wave's tests intact.
