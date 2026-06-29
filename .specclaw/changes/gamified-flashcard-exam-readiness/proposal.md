# Proposal: Gamified Flashcard Exam Readiness App

**Created:** 2026-06-29
**Status:** 🟡 Draft

## Problem

Teams targeting professional certifications (e.g. 10 Bistec employees needing Claude Architect certification) lack an engaging, mobile-friendly way to practice exam content. Existing tools are dry, desktop-centric, and don't give a clear "readiness" signal. Low engagement = low pass rates.

## Proposed Solution

Build a mobile-first, gamified flashcard app where candidates complete bite-sized challenge sets to accumulate a readiness score. The experience feels like a game — cartoony visuals, streaks, XP, level badges — rather than a traditional test platform. Admins upload challenge sets (question batches per exam/topic); candidates pick challenges, answer flashcard-style questions, earn points, and see a readiness % dashboard.

Key flows:
- **Candidate**: Browse challenge catalog → pick a challenge set → answer flashcards → see score + XP gained → track readiness %
- **Admin**: Create/edit challenge sets, add questions (MCQ + scenario), assign to exams, set passing thresholds

## Scope

### In Scope
- Exam: Claude Architect certification (initial catalog)
- Challenge catalog with cartoony card-based UI
- Flashcard-style question answering (MCQ, true/false, scenario pick)
- Per-challenge scoring + cumulative readiness % per exam
- XP / badge system (simple cumulative score, no leveling curve)
- Timed full mock exam mode simulating real exam conditions
- PWA with offline support (cached questions for low-connectivity)
- Admin panel: create challenge sets, add/edit questions, manage exams
- Questions seeded from DB (no CSV bulk import at launch)
- Mobile-first responsive design (Tailwind CSS)
- Per-user progress dashboard (topics covered, weak areas, readiness %)
- JWT-based auth with roles: admin, candidate
- Self-hosted deployment via Caddy reverse proxy + Cloudflare Tunnel

### Out of Scope
- PDF export of score reports (post-MVP)
- Third-party LMS integrations
- Video/audio content
- Team/cohort manager view (post-MVP)

## Impact

- **Files affected:** 40–60 (estimated) — full-stack new project
- **Complexity:** large
- **Risk:** low (greenfield, no migration risk)

## Open Questions

_All resolved by owner (2026-06-29):_
1. ✅ Exam at launch: Claude Architect only
2. ✅ XP: simple cumulative score
3. ✅ No team/cohort view at launch
4. ✅ Questions seeded from DB (no CSV import)
5. ✅ Self-hosted via Caddy + Cloudflare Tunnel
6. ✅ Full timed mock exams in scope
7. ✅ PWA offline in scope

---

**To proceed:** Review this proposal and approve to begin planning.
