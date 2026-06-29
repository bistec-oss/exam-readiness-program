# Proposal: Exam Catalog & Challenge Flashcard Flow

**Created:** 2026-06-29
**Status:** 🟡 Draft

## Problem

Core candidate experience: browse exams → pick a challenge set → answer flashcard questions → see score + XP earned. This is the primary engagement loop.

## Proposed Solution

Exam catalog page listing available exams. Per-exam challenge catalog with cartoony cards showing topic, question count, XP reward. ChallengePlay page presents questions one-at-a-time as animated flashcards; shows feedback + explanation after each answer; posts attempt to API on completion and updates XP.

## Scope

### In Scope
- `GET /api/exams` — exam list
- `GET /api/exams/[id]/challenges` — challenge sets per exam
- `GET /api/challenges/[id]/questions` — questions for a challenge set
- `POST /api/attempts` — submit completed challenge attempt; increment user XP
- Exam catalog page (`/exams`)
- Challenge catalog page (`/exams/[id]`)
- FlashCard component (animated, shows feedback + explanation)
- ChallengePlay page (`/challenges/[id]/play`)
- Challenge completion summary (score, XP earned)
- Mobile-first, cartoony card UI (Tailwind)

### Out of Scope
- Mock exam (04-mock-exam)
- Progress dashboard (05-progress-gamification)
- Offline play (07-pwa-offline)

## Impact

- **Files affected:** 12–16
- **Complexity:** medium
- **Risk:** low

## Open Questions

_None._

---

**To proceed:** Approve to begin planning.
