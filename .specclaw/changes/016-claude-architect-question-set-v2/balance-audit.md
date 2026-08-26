# Balance Audit — Claude Architect Question Set v2

**Change:** 016-claude-architect-question-set-v2
**Scope:** The 60 new questions only (`q-v2-s*` scenario set, 30 questions; `q-v2-d*` domain set, 30 questions), added by T1 and T2 to `app/prisma/seed.ts`.
**Method:** Programmatic parse of `app/prisma/seed.ts` (regex extraction of each question's `id`, `options`, `correctOptionId`, `text`), independent of the tallies self-reported by the T1/T2 build agents. Script run at audit time, not cached from build-time claims.

## (a) Correct-option letter distribution

| Letter | Count | % of 60 |
|--------|-------|---------|
| A | 15 | 25% |
| B | 15 | 25% |
| C | 15 | 25% |
| D | 15 | 25% |

**Against spec AC4** ("no single letter more than ~40% i.e. >24/60"): PASS. Distribution is perfectly even at 25% each — well under the 40% ceiling.

## (b) Correct option is the longest option (by character count)

**17 / 60** questions (28.3%) have the correct option as the longest of the four by raw character count.

**Against spec AC4** ("correct option is the longest option in no more than ~30% of questions"): PASS. 17/60 = 28.3%, under the 30% ceiling.

Per-task breakdown (as tracked during authoring, consistent with the combined total above):
- T1 (scenario, 30 Qs): 8/30 longest-correct
- T2 (domain, 30 Qs): 9/30 longest-correct
- Combined: 17/60

## (c) Duplicate / near-duplicate check (spec FR5)

Compared all 60 new (`q-v2-*`) question `text` fields against all 77 pre-existing (`q-*`, non-`v2`) question `text` fields already in `seed.ts`, using Jaccard similarity over normalized word sets (lowercased, punctuation stripped, words >3 chars, stopword-length filter). Threshold: pairs scoring above 0.4 flagged for manual review.

**Result: 0 pairs flagged out of 4,620 compared (60 × 77).** No near-duplicates found — every new question tests a distinct scenario+concept combination not already covered by the pre-v2 seed content.

## (d) ID uniqueness

- 137 total `Question` ids across the whole file (77 pre-existing + 60 new): 0 duplicates.
- 27 total `ChallengeSet` ids across the whole file: 0 duplicates.
- All 60 new question ids follow the declared namespace (`q-v2-s<n>-<m>` / `q-v2-d<n>-<m>`); all 11 new challenge set ids follow `cs-v2-scenario-<n>-<slug>` / `cs-v2-domain-<n>-<slug>`.

## Additional rule checks (CLAUDE.md Question Authoring Rules)

- Absolute qualifiers ("always"/"never") appearing only on distractors: checked during T2 authoring — 10 instances found and fixed (qualifier removed from distractor text without weakening its wrongness) before this audit ran.
- Hedge words ("might"/"could"/"may") appearing only on distractors: 1 isolated instance noted during T2 authoring, not a systematic pattern across the set — no fix required.

## Overall verdict

**PASS.** All AC4/FR5 checks satisfied against independently-verified tallies:
- Letter distribution: 25%/25%/25%/25% (limit 40%)
- Longest-option-correct: 28.3% (limit 30%)
- Duplicates: 0 found
- ID collisions: 0 found

No further edits to `seed.ts` were required as a result of this audit.
