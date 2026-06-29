# Proposal: Progress Dashboard & Gamification (XP + Readiness %)

**Created:** 2026-06-29
**Status:** 🟡 Draft

## Problem

Candidates need clear feedback on whether they're ready for the exam. Raw scores alone aren't motivating. XP accumulation + a readiness % give tangible progress signals that drive continued engagement.

## Proposed Solution

Candidate dashboard shows: cumulative XP bar, readiness % circular gauge, completed challenge sets, weak topics (lowest scoring), mock exam history. Readiness % computed server-side: `(avgChallengeScore × 0.5) + (bestMockScore × 0.5)`. XP is pure cumulative sum across all attempts. Milestone badges shown at thresholds (first challenge, 50% ready, 100% challenges done).

## Scope

### In Scope
- `GET /api/progress` — XP, readiness %, per-topic scores, weak topics, attempt history
- Dashboard page (`/dashboard`) — default landing after login
- XPBar component (cumulative XP display)
- ReadinessGauge component (circular SVG, % fill)
- Weak topics list (topics with lowest avg score)
- Challenge completion history table
- Mock exam history table
- Milestone badge display (3 badges: first attempt, 50% ready, all challenges done)

### Out of Scope
- Leaderboard / team view
- Leveling curve (pure cumulative XP)
- Push notifications

## Impact

- **Files affected:** 8–10
- **Complexity:** medium
- **Risk:** low

## Open Questions

_None._

---

**To proceed:** Approve to begin planning.
