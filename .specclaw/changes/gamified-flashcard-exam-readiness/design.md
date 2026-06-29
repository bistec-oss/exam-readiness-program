# Design: Gamified Flashcard Exam Readiness App

**Change:** gamified-flashcard-exam-readiness
**Created:** 2026-06-29

## Technical Approach

Full-stack monorepo: Express REST API backend + React SPA frontend, both containerized. PostgreSQL in production via Prisma ORM. Frontend served as static files by Caddy (which also reverse-proxies `/api` to backend). Cloudflare Tunnel makes the Caddy instance publicly reachable without opening firewall ports.

PWA implemented with Vite PWA plugin (Workbox under the hood) — service worker caches static assets + question data; IndexedDB stores offline attempt data pending sync.

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Cloudflare Tunnel                              │
│    └── Caddy (TLS termination + reverse proxy)  │
│          ├── /* → frontend (static SPA)         │
│          └── /api/* → backend:3001              │
└─────────────────────────────────────────────────┘

Frontend (React + Vite + Tailwind)
  ├── PWA Service Worker (Workbox)
  ├── IndexedDB (offline attempt queue)
  └── React Query (data fetching + cache)

Backend (Node.js + Express)
  ├── /api/auth        — register, login, refresh, logout
  ├── /api/exams       — exam catalog
  ├── /api/challenges  — challenge sets + questions
  ├── /api/attempts    — submit answers, sync offline attempts
  ├── /api/progress    — user dashboard data
  └── /api/admin       — admin CRUD (role-gated)

PostgreSQL (via Prisma)
  └── seed.ts → Claude Architect questions
```

## File Changes Map

| File | Action | Description |
|------|--------|-------------|
| `docker-compose.yml` | create | Services: backend, frontend build, postgres, caddy |
| `Caddyfile` | create | Reverse proxy config + static file serving |
| `backend/package.json` | create | Express, Prisma, JWT, bcrypt, cors |
| `backend/prisma/schema.prisma` | create | Full DB schema |
| `backend/prisma/seed.ts` | create | Claude Architect questions seed |
| `backend/src/index.ts` | create | Express app entry point |
| `backend/src/middleware/auth.ts` | create | JWT verify + role guard middleware |
| `backend/src/routes/auth.ts` | create | Register, login, refresh, logout |
| `backend/src/routes/exams.ts` | create | Exam catalog endpoints |
| `backend/src/routes/challenges.ts` | create | Challenge sets + questions |
| `backend/src/routes/attempts.ts` | create | Submit attempts, offline sync |
| `backend/src/routes/progress.ts` | create | Dashboard aggregation |
| `backend/src/routes/admin.ts` | create | Admin CRUD for exams/challenges/questions |
| `frontend/package.json` | create | React, Vite, Tailwind, React Query, Workbox |
| `frontend/vite.config.ts` | create | Vite + PWA plugin config |
| `frontend/public/manifest.json` | create | PWA manifest |
| `frontend/src/main.tsx` | create | React entry + service worker registration |
| `frontend/src/App.tsx` | create | Router + layout shell |
| `frontend/src/contexts/AuthContext.tsx` | create | JWT state + refresh logic |
| `frontend/src/pages/Login.tsx` | create | Login/register page |
| `frontend/src/pages/ExamCatalog.tsx` | create | Exam list view |
| `frontend/src/pages/ChallengeCatalog.tsx` | create | Challenge sets for an exam |
| `frontend/src/pages/ChallengePlay.tsx` | create | Flashcard Q&A flow |
| `frontend/src/pages/MockExam.tsx` | create | Timed mock exam flow |
| `frontend/src/pages/MockExamReview.tsx` | create | Post-exam answer review |
| `frontend/src/pages/Dashboard.tsx` | create | Candidate progress dashboard |
| `frontend/src/pages/admin/AdminExams.tsx` | create | Admin exam management |
| `frontend/src/pages/admin/AdminChallenges.tsx` | create | Admin challenge management |
| `frontend/src/pages/admin/AdminQuestions.tsx` | create | Admin question editor |
| `frontend/src/components/FlashCard.tsx` | create | Animated flashcard component |
| `frontend/src/components/XPBar.tsx` | create | XP cumulative display |
| `frontend/src/components/ReadinessGauge.tsx` | create | Circular readiness % gauge |
| `frontend/src/components/Timer.tsx` | create | Countdown timer for mock exam |
| `frontend/src/lib/offlineQueue.ts` | create | IndexedDB offline attempt queue |
| `frontend/src/lib/syncAttempts.ts` | create | Sync offline queue on reconnect |

## Data Model

```prisma
model User {
  id           String    @id @default(cuid())
  email        String    @unique
  passwordHash String
  role         Role      @default(CANDIDATE)
  xp           Int       @default(0)
  createdAt    DateTime  @default(now())
  attempts     Attempt[]
  mockAttempts MockAttempt[]
}

enum Role { ADMIN CANDIDATE }

model Exam {
  id              String         @id @default(cuid())
  name            String
  description     String
  passingScore    Int            // percentage e.g. 70
  durationMinutes Int            @default(90)
  challengeSets   ChallengeSet[]
  questions       Question[]     // for mock exam pool
}

model ChallengeSet {
  id          String     @id @default(cuid())
  title       String
  topic       String
  xpReward    Int        @default(50)
  examId      String
  exam        Exam       @relation(fields: [examId], references: [id])
  questions   Question[]
  attempts    Attempt[]
}

model Question {
  id              String       @id @default(cuid())
  text            String
  preamble        String?      // scenario context
  type            QuestionType @default(MCQ)
  options         Json         // [{id, text}]
  correctOptionId String
  explanation     String
  challengeSetId  String?
  challengeSet    ChallengeSet? @relation(fields: [challengeSetId], references: [id])
  examId          String
  exam            Exam         @relation(fields: [examId], references: [id])
}

enum QuestionType { MCQ TRUE_FALSE }

model Attempt {
  id             String       @id @default(cuid())
  userId         String
  user           User         @relation(fields: [userId], references: [id])
  challengeSetId String
  challengeSet   ChallengeSet @relation(fields: [challengeSetId], references: [id])
  answers        Json         // [{questionId, selectedOptionId, correct}]
  score          Int          // correct count
  total          Int
  xpEarned       Int
  completedAt    DateTime     @default(now())
  syncedAt       DateTime?    // null = synced from offline
}

model MockAttempt {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  examId      String
  answers     Json
  score       Int
  total       Int
  timeUsed    Int      // seconds
  completedAt DateTime @default(now())
}
```

## API Changes

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout

GET    /api/exams
GET    /api/exams/:id/challenges

GET    /api/challenges/:id/questions
POST   /api/attempts                    — submit challenge attempt
POST   /api/attempts/sync               — batch sync offline attempts

GET    /api/mock-exams/:examId/questions
POST   /api/mock-exams                  — submit mock exam

GET    /api/progress                    — dashboard data for current user

# Admin (role: ADMIN required)
GET/POST         /api/admin/exams
PUT/DELETE       /api/admin/exams/:id
GET/POST         /api/admin/challenges
PUT/DELETE       /api/admin/challenges/:id
GET/POST         /api/admin/questions
PUT/DELETE       /api/admin/questions/:id
```

## Key Decisions

1. **Monorepo structure** — `backend/` + `frontend/` subdirs in one repo; Docker Compose ties them together. Simpler than separate repos for a small team.
2. **Caddy serves frontend static files** — Vite builds to `frontend/dist`, Caddy mounts it; no separate Nginx needed.
3. **Prisma over raw SQL** — type-safe queries + migrations; seed script in TypeScript keeps question data version-controlled.
4. **React Query for data fetching** — handles caching, background refresh, optimistic updates; pairs well with offline queue.
5. **Workbox `StaleWhileRevalidate`** for question data — serve cached immediately, update in background; good for low-connectivity UX.
6. **IndexedDB for offline queue** — attempts stored locally on submit; `syncAttempts.ts` drains queue when `navigator.onLine` = true.
7. **Readiness % formula** — `(avgChallengeScore × 0.5) + (bestMockScore × 0.5)` computed server-side in `/api/progress`.
8. **JWT in httpOnly cookies** — prevents XSS token theft; refresh token rotation on each use.

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Offline sync conflicts (same attempt submitted twice) | Idempotency key (client-generated attempt ID); server deduplicates on `id` |
| Mock exam timer manipulation (client-side) | Server records `startedAt` on exam start; validates `timeUsed ≤ durationMinutes × 60 + 30s buffer` on submit |
| Seed script large question volume | Seed is idempotent (upsert on question text hash); safe to re-run |
| Cloudflare Tunnel expiry / token rotation | Token stored in Docker secret / env var; documented in README |
