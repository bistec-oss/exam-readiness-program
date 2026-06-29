# Tasks: Gamified Flashcard Exam Readiness App

**Change:** gamified-flashcard-exam-readiness
**Created:** 2026-06-29
**Total Tasks:** 18

## Summary

18 tasks across 5 waves. Wave 1 scaffolds the full-stack project structure and DB schema. Wave 2 builds auth and the core API. Wave 3 builds the candidate frontend flows. Wave 4 adds admin panel + PWA offline. Wave 5 wires up deployment (Docker Compose + Caddy).

## Tasks

### Wave 1 — Project scaffold + DB schema

- [ ] `T1` — Scaffold monorepo structure: `backend/`, `frontend/`, root `docker-compose.yml`
  - Files: `backend/package.json`, `backend/tsconfig.json`, `frontend/package.json`, `frontend/vite.config.ts`, `frontend/tsconfig.json`, `docker-compose.yml`, `.gitignore`
  - Estimate: medium
  - Notes: Backend: Express + TypeScript + Prisma. Frontend: React + Vite + Tailwind + React Query. Docker Compose: backend, postgres, caddy services.

- [ ] `T2` — Define Prisma schema + run initial migration + seed Claude Architect questions
  - Files: `backend/prisma/schema.prisma`, `backend/prisma/migrations/`, `backend/prisma/seed.ts`
  - Estimate: medium
  - Depends: T1
  - Notes: Schema per design.md. Seed ≥ 20 Claude Architect questions across ≥ 3 challenge sets covering core topics (AI safety, model capabilities, responsible use, architect patterns).

### Wave 2 — Backend API

- [ ] `T3` — Auth routes + JWT middleware (register, login, refresh, logout)
  - Files: `backend/src/middleware/auth.ts`, `backend/src/routes/auth.ts`, `backend/src/index.ts`
  - Estimate: medium
  - Depends: T1, T2
  - Notes: JWT in httpOnly cookies. Access token 15min, refresh 7 days. bcrypt cost 12. Role stored in JWT payload.

- [ ] `T4` — Exam catalog + challenge set API endpoints
  - Files: `backend/src/routes/exams.ts`, `backend/src/routes/challenges.ts`
  - Estimate: small
  - Depends: T3

- [ ] `T5` — Attempt submission + offline sync API endpoints
  - Files: `backend/src/routes/attempts.ts`
  - Estimate: medium
  - Depends: T4
  - Notes: `POST /api/attempts` — single attempt. `POST /api/attempts/sync` — batch. Idempotency via client-generated ID. XP increment on User record.

- [ ] `T6` — Mock exam endpoints (fetch questions, submit, timer validation)
  - Files: `backend/src/routes/mock-exams.ts`
  - Estimate: medium
  - Depends: T5
  - Notes: Server records `startedAt` on question fetch. Submit validates `timeUsed` against `durationMinutes`. Score saved to `MockAttempt`.

- [ ] `T7` — Progress dashboard API + admin CRUD API
  - Files: `backend/src/routes/progress.ts`, `backend/src/routes/admin.ts`
  - Estimate: medium
  - Depends: T5, T6
  - Notes: `/api/progress` computes readiness % + XP + weak topics server-side. Admin routes gated by `requireRole('ADMIN')` middleware.

### Wave 3 — Frontend candidate flows

- [ ] `T8` — Auth pages + AuthContext + protected routing
  - Files: `frontend/src/contexts/AuthContext.tsx`, `frontend/src/pages/Login.tsx`, `frontend/src/App.tsx`
  - Estimate: medium
  - Depends: T3
  - Notes: React Router v6. Protected route component. Silent refresh on 401. Redirect to `/login` if unauthenticated.

- [ ] `T9` — Exam catalog page + challenge catalog page
  - Files: `frontend/src/pages/ExamCatalog.tsx`, `frontend/src/pages/ChallengeCatalog.tsx`
  - Estimate: small
  - Depends: T8
  - Notes: Cartoony card grid. Show XP reward per challenge set. Mobile-first layout.

- [ ] `T10` — FlashCard component + ChallengePlay page (flashcard Q&A flow)
  - Files: `frontend/src/components/FlashCard.tsx`, `frontend/src/pages/ChallengePlay.tsx`
  - Estimate: medium
  - Depends: T9
  - Notes: Animated flip/slide between questions. Show feedback + explanation after each answer. Score summary + XP earned on completion.

- [ ] `T11` — MockExam page (timer, question flow) + MockExamReview page
  - Files: `frontend/src/components/Timer.tsx`, `frontend/src/pages/MockExam.tsx`, `frontend/src/pages/MockExamReview.tsx`
  - Estimate: medium
  - Depends: T10
  - Notes: Timer component counts down, auto-submits on zero. Review page shows all answers with correct/incorrect indicators.

- [ ] `T12` — Dashboard page (XP bar, readiness gauge, weak topics, history)
  - Files: `frontend/src/components/XPBar.tsx`, `frontend/src/components/ReadinessGauge.tsx`, `frontend/src/pages/Dashboard.tsx`
  - Estimate: medium
  - Depends: T11
  - Notes: Circular SVG readiness gauge. Cartoony badge icons for milestones. Weak topics list from API.

### Wave 4 — Admin panel + PWA offline

- [ ] `T13` — Admin panel pages (manage exams, challenge sets, questions)
  - Files: `frontend/src/pages/admin/AdminExams.tsx`, `frontend/src/pages/admin/AdminChallenges.tsx`, `frontend/src/pages/admin/AdminQuestions.tsx`
  - Estimate: medium
  - Depends: T12
  - Notes: CRUD forms per entity. Route-guarded to ADMIN role (403 for candidates). Simple table + modal/drawer pattern.

- [ ] `T14` — PWA manifest + Vite PWA plugin + service worker (Workbox)
  - Files: `frontend/public/manifest.json`, `frontend/vite.config.ts` (update), `frontend/src/main.tsx` (SW registration)
  - Estimate: medium
  - Depends: T9
  - Notes: Workbox `StaleWhileRevalidate` for `/api/challenges` + `/api/exams`. App shell cached with `CacheFirst`. Manifest: name, icons, display standalone, theme color.

- [ ] `T15` — Offline attempt queue (IndexedDB) + sync on reconnect
  - Files: `frontend/src/lib/offlineQueue.ts`, `frontend/src/lib/syncAttempts.ts`
  - Estimate: medium
  - Depends: T14, T5
  - Notes: On `POST /api/attempts` network failure → write to IndexedDB queue. On `navigator.online` event → drain queue. Offline indicator UI component.

### Wave 5 — Deployment wiring

- [ ] `T16` — Dockerfile for backend + frontend build stage
  - Files: `backend/Dockerfile`, `frontend/Dockerfile`
  - Estimate: small
  - Depends: T1
  - Notes: Multi-stage builds. Backend: node:20-alpine. Frontend: build stage → copy dist to Caddy image.

- [ ] `T17` — Caddyfile + Docker Compose final config
  - Files: `Caddyfile`, `docker-compose.yml` (update), `.env.example`
  - Estimate: small
  - Depends: T16
  - Notes: Caddy serves `frontend/dist` at `/`; reverse proxies `/api/*` to `backend:3001`. Cloudflare Tunnel token via env var. Postgres volume + health check.

- [ ] `T18` — README with setup, seed, and Cloudflare Tunnel instructions
  - Files: `README.md`
  - Estimate: small
  - Depends: T17
  - Notes: `docker compose up`, how to run seed, how to configure Cloudflare Tunnel token, default admin credentials.

---

## Legend

- `[ ]` Pending
- `[~]` In Progress
- `[x]` Complete
- `[!]` Failed
