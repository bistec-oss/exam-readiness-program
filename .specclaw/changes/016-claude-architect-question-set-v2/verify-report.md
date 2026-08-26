# Verification Report: 016-claude-architect-question-set-v2

**Verified:** 2026-08-26
**Model:** claude-sonnet-5
**Verdict:** PARTIAL

## Acceptance Criteria

- ✅ **AC1:** `git diff` on `app/prisma/seed.ts` shows only additions (no lines removed/modified in the existing seed blocks) — `git diff main...HEAD --numstat -- app/prisma/seed.ts` → `988  0  app/prisma/seed.ts` (988 insertions, **0 deletions**) against a single contiguous hunk (`@@ -255,6 +255,994 @@`). Confirms the 5 committed T1/T2/T3 commits are pure additions relative to `main`.
  - ⚠️ Edge case: the working tree currently has an **uncommitted** further edit to `app/prisma/seed.ts` (`git diff HEAD`) — 3 lines of paraphrase-only text tweaks (e.g. `"before ending the turn"` → unchanged, `"before the next release"` → `"before the upcoming release"`, `"moving to the next one to save time"` → `"moving on to save time"`). These 3 edits fall entirely inside the newly-added v2 block (confirmed: none of the modified lines exist in `main`'s version of the file), so they do not touch pre-existing/original seed content and do not violate AC1's "no edits to existing blocks" requirement. However, they are **not committed** — if a PR is opened from the current commit history without committing this diff, these minor wording fixes will be silently lost. Recommend committing before `/specclaw:pr`.

- ✅ **AC2:** After `npx prisma db seed`, the `claude-architect-v1` exam has 11 additional `ChallengeSet` rows and 60 additional `Question` rows — per supplied DB evidence: *"queried `claude-architect-v1` exam's challengeSets — exactly 11 sets with id prefix `cs-v2-`, containing exactly 60 questions total."* Independently cross-checked against `seed.ts` content: `grep -oE '"cs-v2-[a-z0-9-]+"'` finds exactly 11 unique ids (6 `cs-v2-scenario-*`, 5 `cs-v2-domain-*`); question-id tally by set shows `d1..d5` = 6 each (30) and `s1..s6` = 5 each (30) = 60 total, matching FR2's target counts.

- ✅ **AC3:** Re-running `npx prisma db seed` a second time does not error and does not create duplicate rows — per supplied evidence: *"Ran `npx tsx prisma/seed.ts` a second time... exit 0, no errors, and the v2 challenge-set/question counts were re-queried and are still exactly 11 sets / 60 questions (unchanged)."* Backed by static code evidence: the v2 seed loops use `prisma.challengeSet.upsert({ where: { id: csData.id }, update: {}, create: {...} })` and `prisma.question.upsert({ where: { id: q.id }, update: {}, create: {...} })` (verified at `app/prisma/seed.ts:733-750`), matching FR4's required idempotent pattern.

- ✅ **AC4:** Balance check confirms letter distribution and length-tell limits — `.specclaw/changes/016-claude-architect-question-set-v2/balance-audit.md` (independently re-derived via a programmatic script, not self-reported build tallies): *"Letter | Count | % of 60 — A 15 (25%), B 15 (25%), C 15 (25%), D 15 (25%)"* (limit ~40%/24 questions, actual max 25%/15) and *"17 / 60 questions (28.3%) have the correct option as the longest... under the 30% ceiling"* (limit 30%, actual 28.3%). Also reports 0 near-duplicates against the 77 pre-existing questions (Jaccard similarity, 4,620 pairs compared) and 0 id collisions across all 137 questions / 27 challenge sets.
  - ⚠️ Edge case (non-blocking, not itself an AC): the same audit notes *"Hedge words... 1 isolated instance noted during T2 authoring, not a systematic pattern... no fix required."* This is a minor residual FR6 imperfection (not covered by AC4's letter/length wording specifically) — acceptable per the audit's own "not systematic" framing, but worth a follow-up glance.

- ❌ **AC5:** `/exams` → Claude Architect Certification → each new challenge set is browsable and playable end-to-end (flashcard flow), matching existing e2e coverage pattern in `app/e2e/03-exam-challenge-flow.spec.ts` — **no e2e coverage exists for any of the 11 new `cs-v2-*` sets.** `grep -n "cs-v2-\|q-v2-" app/e2e/*.spec.ts` returns **zero matches** across the entire e2e suite. `app/e2e/03-exam-challenge-flow.spec.ts` (the pattern AC5 asks to match) hardcodes pre-existing, non-v2 set names/ids only (e.g. `page.getByText("Safety & Responsible AI")`, `page.goto("/challenges/cs-safety-principles/play")`). `app/e2e/13-architect-foundations-levels.spec.ts` (cited in the supplied evidence as relevant) tests an entirely unrelated prior set of levels (`cca-d1-agentic-orchestration`, `cca-d1b-...` "Practice Set B", etc.) — none of these ids overlap with the 016 `cs-v2-*`/`q-v2-*` namespace. `tasks.md` for this change (T1/T2/T3) also never planned an e2e task — only content-authoring and a balance-audit doc. The DB-level verification (AC2) confirms the *data* exists and is structurally sound, and the underlying UI code path is shared/unchanged (per spec Dependencies: "no changes to... the existing challenge-flow UI"), so a functional break is unlikely — but AC5 explicitly requires demonstrated browsable/playable end-to-end coverage, and none was produced or run.
  - ⚠️ Edge case: no manual click-through or new automated check was performed against a live app instance either (dev server was not reachable in this environment to spot-check manually: `curl` to `:3000`/`:3010` both returned no response).

- ✅ **AC6:** Existing e2e suite (`app/e2e/*.spec.ts`) still passes unmodified — per supplied evidence: *"`npx playwright test --workers=1` (full e2e suite, chromium) — 154 passed, 0 failed, ~4.5 minutes."* This run included `03-exam-challenge-flow.spec.ts` and `13-architect-foundations-levels.spec.ts` against a DB seeded with the new v2 content, confirming no regression to existing coverage from the additive seed changes.

- ✅ **AC7:** `npm run lint` and `npm run build` (in `app/`) pass — per supplied evidence: *"`cd app && npm run lint` — exit 0, zero warnings/errors output."* and *"`cd app && npm run build` — completed successfully, all routes compiled (Next.js production build), no errors."*

## Test Results

- Lint: exit 0, zero warnings/errors (manually run; `.specclaw/config.yaml` has no lint command wired up).
- Build: Next.js production build completed successfully, all routes compiled, no errors (manually run).
- E2E: `npx playwright test --workers=1` — **154 passed, 0 failed** (~4.5 min, chromium). No dedicated spec exercises the new `cs-v2-*`/`q-v2-*` content specifically (see AC5).
- DB: `claude-architect-v1` exam confirmed to have exactly 11 `cs-v2-*` challenge sets / 60 `q-v2-*` questions after first seed run; unchanged after a second seed run (idempotency confirmed).

## Issues Found

1. **AC5 has no automated or manual end-to-end verification** — none of the 11 new challenge sets (`cs-v2-scenario-1-customer-support-agent` through `cs-v2-domain-5-context-reliability`) are referenced by any spec in `app/e2e/`. **Fix:** add a small e2e spec (or extend `03-exam-challenge-flow.spec.ts`) that navigates to `/exams/claude-architect-v1`, opens at least one `cs-v2-*` set, answers through the flashcard flow, and confirms completion — ideally parameterized/looped across all 11 new sets similar to the pattern in `13-architect-foundations-levels.spec.ts`'s API-based checks (`GET /api/challenges/{id}/questions` + count assertions) combined with one full UI play-through.
2. **Uncommitted working-tree changes to `app/prisma/seed.ts`** — 3 lines of in-flight wording polish are not committed to any of the T1/T2/T3 commits. **Fix:** commit these before running `/specclaw:pr`, otherwise the fixes will not be part of the shipped diff and reviewers will see them as unexplained local drift.
3. **Minor residual hedge-word instance** (non-blocking) — `balance-audit.md` notes one isolated hedge-word-only-on-distractor instance from T2 authoring, deemed non-systematic and left unfixed. **Fix (optional):** locate and rebalance in a follow-up pass if a future content audit touches this exam.

## Summary

**Passed:** 6/7 criteria
**Failed:** 1/7 criteria (AC5)
**Verdict:** PARTIAL
