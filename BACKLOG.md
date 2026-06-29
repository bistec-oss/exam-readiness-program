# Backlog — Bistec Exam Readiness Program

**Stack:** Next.js 14 (App Router) + Prisma + PostgreSQL + Tailwind CSS + next-pwa + Caddy + Cloudflare Tunnel
**Initial exam:** Claude Architect certification
**Deployment:** Self-hosted, Docker Compose, public via Cloudflare Tunnel

---

## Implementation Roadmap

Proposals are tracked in `.specclaw/changes/`. Each proposal maps to a focused implementation slice. Build in order — each wave unblocks the next.

| # | Proposal | Priority | Status | Depends On |
|---|----------|----------|--------|------------|
| 01 | [Next.js Scaffold + DB Schema](.specclaw/changes/01-nextjs-scaffold-db/proposal.md) | 🔴 P0 | ✅ Done | — |
| 02 | [Auth & Role-Based Access](.specclaw/changes/02-auth-roles/proposal.md) | 🔴 P0 | ✅ Done | 01 |
| 03 | [Exam Catalog & Flashcard Flow](.specclaw/changes/03-exam-challenge-flow/proposal.md) | 🔴 P0 | ✅ Done | 01, 02 |
| 04 | [Timed Mock Exam Mode](.specclaw/changes/04-mock-exam/proposal.md) | 🔴 P0 | ✅ Done | 01, 02, 03 |
| 05 | [Progress Dashboard & Gamification](.specclaw/changes/05-progress-gamification/proposal.md) | 🔴 P0 | ✅ Done | 03, 04 |
| 06 | [Admin Panel](.specclaw/changes/06-admin-panel/proposal.md) | 🟠 P1 | ✅ Done | 01, 02 |
| 07 | [PWA Offline Support](.specclaw/changes/07-pwa-offline/proposal.md) | 🟠 P1 | ✅ Done | 03 |
| 08 | [Docker + Caddy + Cloudflare Tunnel](.specclaw/changes/08-deployment/proposal.md) | 🟠 P1 | ✅ Done | 01 |
| 09 | [System Deploy - podman + existing host caddy/cloudflared](.specclaw/changes/09-system-deploy-practice-site/proposal.md) | 🟠 P1 | ✅ Done | 01 |

---

## Feature Summary

### P0 — Core MVP (must ship before launch)

**01 · Next.js Scaffold + DB Schema**
- Next.js 14 App Router, TypeScript, Tailwind CSS
- Prisma schema: User, Exam, ChallengeSet, Question, Attempt, MockAttempt
- DB migration + Claude Architect seed (≥ 20 questions, ≥ 3 challenge sets)

**02 · Auth & Role-Based Access**
- Register / login / logout / silent refresh
- JWT in httpOnly cookies (access 15min, refresh 7 days)
- Two roles: `admin`, `candidate`
- Next.js middleware guards routes by role

**03 · Exam Catalog & Flashcard Flow**
- Browse exams → pick challenge set → answer flashcards
- Animated FlashCard component with per-answer feedback + explanation
- Submit attempt, earn XP on completion
- Mobile-first cartoony card UI

**04 · Timed Mock Exam Mode**
- Full randomized exam, countdown timer
- Auto-submit on expiry; server validates time
- Post-exam review showing all answers
- Score saved to MockAttempt; feeds readiness %

**05 · Progress Dashboard & Gamification**
- Readiness % gauge: `(avgChallengeScore × 0.5) + (bestMockScore × 0.5)`
- Cumulative XP bar
- Weak topics list, challenge + mock exam history
- 3 milestone badges (first attempt, 50% ready, all challenges done)

### P1 — Launch completers

**06 · Admin Panel**
- `/admin` section, role-gated to ADMIN
- CRUD: exams, challenge sets, questions (MCQ + true/false)
- Question editor with options, correct answer, explanation

**07 · PWA Offline Support**
- `next-pwa` service worker (Workbox)
- Offline challenge play: answers queued in IndexedDB
- Sync to `/api/attempts/sync` on reconnect
- Offline indicator UI

**08 · Docker + Caddy + Cloudflare Tunnel**
- Docker Compose: Next.js app + PostgreSQL + Caddy
- Caddyfile reverse proxy config
- Cloudflare Tunnel via env var token
- README: setup, seed, tunnel config

---

## Post-MVP Backlog

| Feature | Notes |
|---------|-------|
| ✅ CSV bulk question import | Admin uploads/pastes CSV; server parses + validates + bulk-creates. `/admin/questions` UI + `POST /api/admin/questions/import` |
| ✅ PDF score report export | Candidate downloads readiness summary PDF via `GET /api/progress/report` (dependency-free generator) |
| ✅ Team/cohort manager view | "8/10 team members ≥ 80% ready" dashboard |
| ✅ Additional exam catalogs | AWS SAA, Azure AZ-900, Scrum PSM-I |
| ✅ Leaderboard | Opt-in XP ranking within cohort. `/leaderboard` page + `GET /api/leaderboard` (cohort-scoped, opted-in only), opt-in toggle via `PATCH /api/me/preferences` |
| ✅ Email notifications | Weekly readiness summary email. Admin `POST /api/notifications/weekly` generates per-user summaries (persisted to `EmailLog`), candidate inbox at `/settings` + `GET /api/notifications`, opt-out via `PATCH /api/me/preferences` |
| CI/CD pipeline | GitHub Actions → Docker Hub → self-hosted deploy |
| User management (admin) | Invite, suspend, role-change |

---

## Architecture

```
Cloudflare Tunnel
  └── Caddy (TLS + reverse proxy)
        └── Next.js app (App Router + API Routes)
              └── PostgreSQL (via Prisma)
```

**Key tech decisions:**
- Next.js API routes replace separate Express backend — less ops overhead
- Prisma handles migrations + type-safe queries
- `next-pwa` / Workbox for service worker — integrates cleanly with Next.js build
- IndexedDB for offline attempt queue (not localStorage — structured data, larger quota)
- JWT in httpOnly cookies — XSS-safe token storage
