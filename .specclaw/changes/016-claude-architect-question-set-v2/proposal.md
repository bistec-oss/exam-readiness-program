# Proposal: Claude Architect Question Set v2 (60 new questions)

**Created:** 2026-08-26
**Status:** 🟡 Draft

## Problem

_What problem are we solving? Why does it matter?_

The "Claude Architect Certification" exam has a limited question bank (~10 challenge sets, seeded in `app/prisma/seed.ts`). A fresh, richer source pack (Obsidian vault export "Claude Architect Exam": 5 domain notes, 6 scenario notes, 12 official sample questions, anti-patterns cheatsheet, sources) was provided and should be turned into new practice content so candidates get more coverage and don't burn out on repeats.

Separately, an audit of the existing seeded questions found a real flaw: the correct option is frequently the longest option (e.g. `q-csa-1` in `seed.ts`), which lets test-takers guess the answer from option length rather than reasoning. `CLAUDE.md` was just updated with a "Question Authoring Rules" section banning this and other structural tells (letter-position clustering, hedge-word/absolute-qualifier tells). New content must be authored compliant with that rule from the start.

## Proposed Solution

_What are we building? High-level approach._

Author 60 new MCQ questions (1 correct + 3 distractors each) grounded in the 5 domains and 6 scenarios from the source pack, organized into new challenge sets, and add them to `app/prisma/seed.ts` under the existing `claude-architect-v1` exam (no new exam entity — same certification, deeper bank).

- Split 60 questions across the 6 scenarios + 5 domains proportionally to the source pack's weighting (Domain 1 heaviest at 27%, etc.), roughly 8-12 questions per challenge set across ~6-7 new challenge sets.
- Each question: `preamble` (scenario context), `text`, 4 `options`, `correctOptionId`, `explanation` — following the existing schema shape already used in `seed.ts`.
- Enforce the new CLAUDE.md authoring rules mechanically while drafting: track correct-letter distribution and correct-vs-distractor length rank per set, rebalance before finalizing so no systematic tell exists.
- Use distinct `id` prefixes (e.g. `cs-v2-...` / `q-v2-...`) so nothing collides with existing seed IDs, and content must be original phrasing (not copy-pasted from the source notes or the existing seed) to avoid duplicate/near-duplicate questions.
- Seed script must remain idempotent (`upsert`-based, matching existing pattern) so re-running seed doesn't duplicate rows.

## Scope

### In Scope
- 60 new MCQ questions with explanations, added as new `ChallengeSet` + `Question` rows via `prisma/seed.ts`.
- New challenge sets grouped by domain/scenario, each with an `xpReward`.
- Manual/scripted check that correct-answer length and letter position are balanced across the new set (documented in verify-report, not a new UI feature).
- Source material consumed: the attached vault content only (already unzipped locally); no live web scraping.

### Out of Scope
- No schema changes (`Question`/`ChallengeSet`/`Exam` models untouched).
- No changes to existing seeded questions/challenge sets (that cleanup, if wanted, is a separate future proposal).
- No new exam entity — questions go under the existing `claude-architect-v1` exam.
- No admin UI changes — questions ship via seed script only, same as prior batches.
- No changes to mock-exam randomization logic.

## Impact

- **Files affected:** 1 (`app/prisma/seed.ts`, additive block) (estimated)
- **Complexity:** medium (small)
- **Risk:** low

## Open Questions

- Should the 60 questions be split into 6 sets of 10 (one per scenario) plus folded domain coverage into scenario preambles, or kept as separate domain-only + scenario-only sets (~11 sets total, smaller each)? Defaulting to the latter (mirrors existing seed structure) unless told otherwise.

---

**To proceed:** Review this proposal and approve to begin planning.
