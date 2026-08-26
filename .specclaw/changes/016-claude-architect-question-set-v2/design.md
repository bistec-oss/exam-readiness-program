# Design: Claude Architect Question Set v2 (60 new questions)

**Change:** 016-claude-architect-question-set-v2
**Created:** 2026-08-26

## Technical Approach

Append one new top-level array to `app/prisma/seed.ts` — `challengeSetsV2` — mirroring the existing `scenarioChallengeSets` pattern already in the file (array of `{ id, title, topic, xpReward, questions: [...] }`), then loop-upsert it the same way the existing arrays are upserted (`prisma.challengeSet.upsert` per set, `prisma.question.upsert` per question, matching the file's existing loop shape). No new arrays' worth of custom logic — reuse the exact upsert pattern already proven in the file for `scenarioChallengeSets` and the later domain-set blocks.

11 new challenge sets, split 6 scenario-based (5 questions each = 30) + 5 domain-based (6 questions each = 30) = 60 total, all under `examId: exam.id` (the existing `claude-architect-v1` exam — no new `Exam` row).

## Architecture

No architectural change — this is a data-only addition to an existing seed script. `Exam` → `ChallengeSet` → `Question` relations already support arbitrary additional sets/questions (schema unchanged). The app's existing challenge-flow, mock-exam randomizer, and study-plan features read questions generically by `examId`/`challengeSetId`, so new rows surface automatically with zero code changes.

## File Changes Map

| File | Action | Description |
|------|--------|-------------|
| `app/prisma/seed.ts` | Modify (additive only) | Append `challengeSetsV2` array (11 sets / 60 questions) after the existing seed arrays, plus an upsert loop for it, before the closing study-plan block. No existing lines changed. |

## Data Model Changes

None. Uses existing `Exam`, `ChallengeSet`, `Question` models as-is (`prisma/schema.prisma` untouched).

## API Changes

None. No new routes; existing `/api/exams`, `/api/mock-exams`, challenge-flow endpoints already serve questions generically by relation.

## Key Decisions

- **Same exam, no new `Exam` row** — the source pack is more Claude Architect content, not a new certification. Matches proposal's stated preference.
- **11 sets (6 scenario + 5 domain), not one giant 60-question set** — mirrors the existing seed's own pattern of one `ChallengeSet` per scenario/domain, keeps each flashcard session a reasonable length (5-6 cards), and keeps `xpReward` grouping sensible.
- **`-v2-` id namespace** (`cs-v2-*` / `q-v2-*`) — guarantees no collision with existing ids (`cs-customer-support-agent`, `q-csa-1`, etc.) without needing to grep-diff every new id against the ~80 existing ones.
- **Existing study plan (`studyPlanSteps`) is not extended** — it hardcodes 7 specific challenge-set ids; folding v2 sets in is a separate, deliberate product decision (which sets, what order, what day offsets) better left to its own proposal. Spec explicitly calls this out as an edge case, not a gap.
- **Answer-length/letter-position balance is enforced by hand during authoring, not by a runtime check** — this is one-time seed content, not a validated user input path, so a build-time linter would be over-engineering per CLAUDE.md's simplicity principle. The balance is verified once, manually, and recorded in `verify-report.md` (AC4).

## Risks & Mitigations

- **Risk:** LLM-authored distractors could unintentionally recreate the same length/letter tell the source pack's own official sample questions exhibit (e.g. `Sample Questions - Official.md` correct answers cluster on A more than B/C/D in the 12-question sample). **Mitigation:** track a running tally of correct-letter and correct-length-rank while drafting each of the two content tasks (scenario sets, domain sets) and rebalance the last few questions in each set deliberately to flatten the distribution before finalizing.
- **Risk:** Near-duplicate questions vs. the ~80 existing seeded questions (same scenario, same underlying "trap"). **Mitigation:** the source pack's 5 domains and 6 scenarios don't 1:1 match the existing seed's topic set (existing seed also covers "Safety & Responsible AI" and "Claude Model Capabilities", which aren't in the source pack), giving natural headroom for non-overlapping content; additionally skim existing `seed.ts` question `text` fields before finalizing each new set to catch accidental overlap.
- **Risk:** Seed script idempotency — running `db seed` twice must not duplicate rows. **Mitigation:** use the identical `upsert`-by-fixed-id pattern already used throughout the file (never `create`), so re-runs are no-ops on unchanged ids.

## Grounding sources

- `CLAUDE.md` (rank 2) — "The correct option must NOT be systematically the longest (or shortest) option in the set" and "Vary the correct option's letter position (A/B/C/D) roughly evenly" — directly drives spec FR6/AC4 and the design's manual-balance-tracking mitigation above.
- `BACKLOG.md` (rank 5) — `**01 · Next.js Scaffold + DB Schema** ... DB migration + Claude Architect seed (≥ 20 questions, ≥ 3 challenge sets)` confirms the seed-script-as-content-delivery pattern this change extends, and that `prisma/schema.prisma` is the stable, unmodified contract.
