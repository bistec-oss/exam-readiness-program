# Tasks: Claude Architect Question Set v2 (60 new questions)

**Change:** 016-claude-architect-question-set-v2
**Created:** 2026-08-26
**Total Tasks:** 3

## Summary

3 tasks across 2 waves. Wave 1 authors the 60 questions in two content passes (scenario sets, then domain sets — serialized on the same file). Wave 2 audits the finished set against the CLAUDE.md authoring rules and records the result.

## Tasks

### Wave 1 — Author question content into seed.ts

- [x] `T1` — Add 6 scenario-based challenge sets (30 questions) to seed.ts
  - Files: `app/prisma/seed.ts`
  - Estimate: large
  - Kind: impl
  - Depends: —
  - Notes: Source: `.specclaw/changes/016-claude-architect-question-set-v2/source/02-Scenarios/*.md` (6 files) + `03-Practice/Sample Questions - Official.md` for calibration only (don't reuse its questions verbatim — spec FR5). One `ChallengeSet` per scenario note, id pattern `cs-v2-scenario-<n>-<slug>`, 5 questions each (ids `q-v2-s<n>-1`..`5`), `topic` = scenario title, `xpReward: 80` (matches existing sets' convention). Each question: `preamble` (scenario setup, can reuse/paraphrase the note's scenario framing), `text`, 4 `options` (`id: a|b|c|d`), `correctOptionId`, `explanation`. Append via `prisma.challengeSet.upsert` + nested `prisma.question.upsert` loop, copying the exact upsert shape already used for `scenarioChallengeSets` earlier in the file — do not invent a new persistence pattern. While drafting, track correct-letter (A-D) and correct-length-rank tallies across all 30 questions in this task; no letter should end up correct more than ~12/30 times, and the correct option should be the longest in no more than ~9/30.

### Wave 2 — Author domain content, then audit

- [x] `T2` — Add 5 domain-based challenge sets (30 questions) to seed.ts
  - Files: `app/prisma/seed.ts`
  - Estimate: large
  - Kind: impl
  - Depends: `T1`
  - Notes: Source: `.specclaw/changes/016-claude-architect-question-set-v2/source/01-Domains/*.md` (5 files) + `00-MOC/Anti-Patterns Cheatsheet.md` for distractor-trap inspiration. One `ChallengeSet` per domain note, id pattern `cs-v2-domain-<n>-<slug>`, 6 questions each (ids `q-v2-d<n>-1`..`6`), `topic` = domain title, `xpReward: 80`. Same question shape and upsert pattern as T1. Depends on T1 only to serialize edits to the same file section (append after T1's block, before the closing `studyPlanSteps` code) — not a logical dependency. Before finalizing, skim existing `seed.ts` question `text` fields (the pre-v2 ~80 questions) to rule out near-duplicates per spec FR5. Track the same letter/length tallies as T1, but combined across all 60 questions now (T1 + T2) so the final distribution satisfies spec AC4 (no letter >~40% i.e. >24/60 correct, correct-option-longest in no more than ~18/60).

- [x] `T3` — Balance audit + duplicate check, recorded for verify
  - Files: `.specclaw/changes/016-claude-architect-question-set-v2/balance-audit.md` (new)
  - Estimate: small
  - Kind: docs
  - Depends: `T2`
  - Notes: Programmatically or manually tally, across the 60 new questions only: (a) correct-option letter distribution (count per A/B/C/D), (b) count of questions where the correct option is the longest by character count, (c) a spot-check list confirming no new question duplicates an existing pre-v2 question's core scenario+concept. Write the tallies and pass/fail against spec AC4/FR5 to `balance-audit.md`. If any check fails, fix the offending question(s) in `seed.ts` (still within this task) before recording a pass. `/specclaw:verify` will cite this file rather than re-deriving the tallies.

---

## Legend

- `[ ]` Pending
- `[~]` In Progress
- `[x]` Complete
- `[!]` Failed
