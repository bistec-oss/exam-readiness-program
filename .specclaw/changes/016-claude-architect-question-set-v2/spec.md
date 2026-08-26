# Spec: Claude Architect Question Set v2 (60 new questions)

**Change:** 016-claude-architect-question-set-v2
**Created:** 2026-08-26
**Status:** 🟡 Draft

## Overview

Add 60 new MCQ questions to the existing `claude-architect-v1` exam, grounded in the provided source pack (5 Domain notes + 6 Scenario notes + official sample questions + anti-patterns cheatsheet), organized into 11 new `ChallengeSet` rows (5 domain sets + 6 scenario sets) appended to `app/prisma/seed.ts`. Content must comply with the new CLAUDE.md "Question Authoring Rules" (no answer-length tell, rotate correct-letter position, no hedge-word/absolute-qualifier tells) and must not duplicate any existing seeded question.

## Requirements

### Functional Requirements

- FR1: 60 new `Question` rows, each with `preamble`, `text`, exactly 4 `options` (MCQ), `correctOptionId`, `explanation`.
- FR2: Questions grouped into 11 new `ChallengeSet` rows under `examId: "claude-architect-v1"` — 6 scenario-based sets (one per Scenario note) and 5 domain-based sets (one per Domain note) — with question counts split so the total is 60 (target: ~5-6 questions per set).
- FR3: All new `id` values (challenge sets and questions) use a `-v2-` namespace segment (e.g. `cs-v2-scenario-1-support-agent`, `q-v2-s1-1`) so they cannot collide with existing IDs in `seed.ts`.
- FR4: Seeding is idempotent — new sets/questions use `prisma.challengeSet.upsert` / `prisma.question.upsert` (or equivalent `create`-if-`upsert`-by-id pattern already used in the file) so re-running `npx prisma db seed` does not duplicate or error.
- FR5: No new question's `text` + `options` combination duplicates or near-duplicates (same scenario + same underlying tested concept) any question already in `seed.ts`'s existing Claude Architect challenge sets.
- FR6: Every question complies with CLAUDE.md's Question Authoring Rules:
  - Correct option is not the longest option in more than ~25-30% of that question's set (never a systematic pattern across the whole 60).
  - Correct option's letter (A-D) is roughly evenly distributed within each challenge set (no letter used for correct answer more than ~40% of the time within a set of 5-6).
  - No hedge words ("might", "could", "may") appearing only on distractors as a tell; no absolute qualifiers ("always"/"never") appearing only on wrong answers as a tell.
  - No option contains embedded justification text that gives away correctness (justification lives in `explanation` only).

### Non-Functional Requirements

- NFR1: New seed block is additive-only — no edits to existing challenge sets, questions, the exam record, or the existing study plan in `seed.ts`.
- NFR2: `npx prisma db seed` (via `ts-node`/tsx as currently configured) runs successfully against the dev DB with no type errors (`tsc --noEmit` or existing lint/build passes).
- NFR3: New content is original phrasing — not copy-pasted verbatim from the source vault notes.

## Acceptance Criteria

Each criterion must pass for the change to be considered complete.

- AC1: `git diff` on `app/prisma/seed.ts` shows only additions (no lines removed/modified in the existing seed blocks).
- AC2: After `npx prisma db seed`, the `claude-architect-v1` exam has 11 additional `ChallengeSet` rows and 60 additional `Question` rows (verifiable via a one-off count query or Prisma Studio).
- AC3: Re-running `npx prisma db seed` a second time does not error and does not create duplicate rows (row counts unchanged on second run).
- AC4: A written balance check (documented in verify-report) confirms: across the 60 new questions, no single letter (A/B/C/D) is the correct answer more than ~40% of the time, and the correct option is the longest option in no more than ~30% of questions.
- AC5: `/exams` → Claude Architect Certification → each new challenge set is browsable and playable end-to-end (flashcard flow), matching existing e2e coverage pattern in `app/e2e/03-exam-challenge-flow.spec.ts`.
- AC6: Existing e2e suite (`app/e2e/*.spec.ts`) still passes unmodified.
- AC7: `npm run lint` and `npm run build` (in `app/`) pass.

## Edge Cases

- A domain/scenario note in the source pack has thin content (e.g. fewer distinguishable testable concepts) — acceptable to have uneven question counts per set as long as the 60 total holds and no set has fewer than 4 questions.
- Existing `studyPlanSteps` in `seed.ts` reference only the original 7 challenge set IDs — new v2 sets are intentionally NOT added to the existing study plan (out of scope; avoids touching study-plan seed logic).
- Mock exam question randomization (`app/app/api/mock-exams`) pulls from all questions under the exam — new questions will automatically appear in mock exams once seeded; this is expected/desired, not a bug to guard against.

## Dependencies

- Depends on proposal `016-claude-architect-question-set-v2` (approved).
- Builds on existing `claude-architect-v1` exam and `Question`/`ChallengeSet` schema (change 01), and the existing challenge-flow UI (change 03) — no changes to either.
- Source material: `.specclaw/changes/016-claude-architect-question-set-v2/source/` (copied from the user-provided vault export).

## Notes

- The CLAUDE.md Question Authoring Rules were added in this same effort (prior commit `docs: add question-authoring rule against answer-length tells`) specifically because the existing seed data violates them (e.g. `q-csa-1`'s correct option A is the longest of the four). Fixing the existing questions is explicitly out of scope for this change — tracked as a possible future backlog item.
