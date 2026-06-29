# Spec: Gamified Flashcard Exam Readiness App

**Change:** gamified-flashcard-exam-readiness
**Created:** 2026-06-29
**Status:** 🟡 Draft

## Overview

Mobile-first gamified web app helping candidates (initially Bistec employees targeting Claude Architect certification) prepare for exams through bite-sized flashcard challenge sets. Candidates earn XP, track readiness %, and take full timed mock exams. App works offline as a PWA. Admins manage exams, challenge sets, and questions via an admin panel. Self-hosted behind Caddy + Cloudflare Tunnel.

## Requirements

### Functional Requirements

**Authentication & Roles**
- FR1: User can register and log in with email + password; JWT issued on login
- FR2: Two roles: `admin` and `candidate`; role assigned at registration (admin self-assigns or seeded)
- FR3: Protected routes enforce role; unauthenticated requests redirect to login

**Exam Catalog**
- FR4: Candidates see list of available exams (initially: Claude Architect) with description, topic count, passing score threshold
- FR5: Each exam has multiple challenge sets grouped by topic

**Challenge Sets**
- FR6: Candidates browse challenge sets per exam, each showing title, topic, question count, XP reward
- FR7: Candidate starts a challenge set — questions presented one at a time as flashcards
- FR8: Questions support MCQ (single correct answer) and true/false; scenario-style preamble optional on any question
- FR9: After each answer: show correct/incorrect feedback + explanation
- FR10: On challenge completion: show score (correct/total), XP earned, and updated cumulative XP
- FR11: Candidates can retry failed challenge sets

**Mock Exam Mode**
- FR12: Candidate can start a full timed mock exam for an exam (all questions from question bank, randomized)
- FR13: Timer counts down from configurable duration (default: 90 minutes for Claude Architect)
- FR14: No per-question feedback during exam; all feedback shown in review after submission
- FR15: Mock exam score saved to history; readiness % updated

**Progress & Dashboard**
- FR16: Candidate dashboard shows: cumulative XP, readiness % per exam, completed challenge sets, weak topics (lowest scoring)
- FR17: Readiness % = weighted average of challenge scores + mock exam scores
- FR18: XP accumulates across all activity; no leveling, pure cumulative score

**Admin Panel**
- FR19: Admin can create/edit/delete exams (name, description, passing threshold, duration)
- FR20: Admin can create/edit/delete challenge sets (title, topic, assigned exam)
- FR21: Admin can create/edit/delete questions (text, type, options, correct answer, explanation, assigned challenge set)
- FR22: DB seed script populates Claude Architect exam with initial question bank

**PWA / Offline**
- FR23: App installable as PWA (manifest + service worker)
- FR24: Cached challenge sets available offline; answers recorded locally and synced on reconnect
- FR25: Offline indicator shown when no network connectivity

### Non-Functional Requirements

- NFR1: Mobile-first responsive UI; all flows usable on 375px viewport
- NFR2: Cartoony visual style — bright palette, rounded corners, playful iconography (emoji/badge icons)
- NFR3: Page load < 3s on 3G; offline mode activates seamlessly
- NFR4: JWT access tokens expire in 15 min; refresh tokens 7 days
- NFR5: Passwords hashed with bcrypt (cost ≥ 12)
- NFR6: Self-hosted: Docker Compose (backend + frontend + PostgreSQL); Caddy handles TLS + reverse proxy; Cloudflare Tunnel exposes publicly
- NFR7: SQLite acceptable for local dev; PostgreSQL for production

## Acceptance Criteria

- AC1: Candidate completes a challenge set start-to-finish on mobile (375px) — questions, feedback, XP shown correctly
- AC2: XP increments after each challenge completion and persists after page refresh
- AC3: Readiness % updates after completing challenge set or mock exam
- AC4: Full mock exam timer counts down; auto-submits on expiry; review page shows all answers
- AC5: Admin creates a new challenge set with 3 questions — candidate can immediately access and complete it
- AC6: App installs as PWA; completing a challenge set offline queues submission; syncs on reconnect
- AC7: Unauthenticated user accessing `/dashboard` is redirected to `/login`
- AC8: Admin route `/admin` returns 403 for candidate role
- AC9: DB seed script runs successfully and populates ≥ 20 Claude Architect questions across ≥ 3 challenge sets
- AC10: Docker Compose `up` starts all services; app accessible at configured domain

## Edge Cases

- EC1: Candidate loses connectivity mid-challenge — offline mode persists answers; sync on reconnect with conflict resolution (last-write wins)
- EC2: Mock exam timer expires while candidate is on last question — auto-submit with current state
- EC3: Admin deletes a challenge set with in-progress attempts — attempts marked abandoned, not corrupted
- EC4: Candidate retries challenge set — new attempt recorded separately; best score used for readiness %
- EC5: JWT expires mid-session — silent refresh via refresh token; fallback to login if refresh also expired
- EC6: Question has only one option left after admin edits — validation prevents save
- EC7: Candidate completes all challenge sets — dashboard shows 100% challenge completion badge, encourages mock exam

## Dependencies

- Node.js + Express (backend API)
- React + Vite (frontend)
- Tailwind CSS (styling)
- PostgreSQL (production DB) / SQLite (dev)
- Prisma ORM (schema + migrations + seed)
- JWT (jsonwebtoken + cookie-parser)
- bcrypt (password hashing)
- Workbox (PWA service worker)
- Docker + Docker Compose
- Caddy (reverse proxy + auto TLS)
- Cloudflare Tunnel (public exposure)

## Notes

- Exam at launch: Claude Architect only; schema supports multiple exams for future expansion
- No CSV import; seed script is the canonical question-load mechanism at launch
- XP is display-only cumulative counter — no level thresholds, no leaderboard at MVP
- Readiness % formula: (avg challenge score × 0.5) + (best mock exam score × 0.5); both components optional if incomplete
