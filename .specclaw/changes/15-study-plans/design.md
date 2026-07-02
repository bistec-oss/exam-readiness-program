# Design: Study Plans — Structured Learning Paths

**Change:** 15-study-plans
**Created:** 2026-07-02

## Technical Approach

Add three Prisma models + one enum, a migration, and a seed extension. Build candidate read APIs that derive step completion in-memory from a single fetch of the user's `Attempt`s and `MockAttempt`s (no new completion table — completion is a pure function of existing data). Admin CRUD mirrors the existing `/api/admin/exams` pattern (`requireAdmin` in-route guard). UI reuses the existing cartoony card/Tailwind style; a shared `StudyPlanTimeline` client component renders the step timeline.

## Architecture

```
Candidate:
  /study-plans          (server page) → GET /api/study-plans
  /study-plans/[id]     (server page) → GET /api/study-plans/[id]/progress
                                         POST /api/study-plans/[id]/enroll
Admin:
  /admin/study-plans    (client page) → /api/admin/study-plans (CRUD plans)
                                         /api/admin/study-plans/[id]/steps (CRUD steps)

Completion derivation (server, read-only):
  attempts = Attempt[userId]          → set of challengeSetIds with score/total ≥ .5
  mocks    = MockAttempt[userId,exam] → best pct
  step.completed = type===CHALLENGE_SET ? passedSets.has(challengeSetId)
                                        : bestMockPct ≥ (threshold ?? exam.passingScore)
```

## File Changes Map

| File | Action | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | modify | Add `StudyPlan`, `StudyPlanStep`, `StudyPlanEnrollment`, enum `StudyPlanStepType`; back-relations on `Exam`, `ChallengeSet`, `User` |
| `prisma/migrations/*` | create | Migration for new tables |
| `prisma/seed.ts` | modify | Upsert one Claude Architect study plan + ordered steps |
| `lib/studyPlan.ts` | create | `deriveStepCompletion(plan, attempts, mocks, exam)` helper returning steps+meta (single source of truth for FR5) |
| `app/api/study-plans/route.ts` | create | GET list plans + enrolled flags |
| `app/api/study-plans/[id]/enroll/route.ts` | create | POST idempotent enroll |
| `app/api/study-plans/[id]/progress/route.ts` | create | GET derived progress |
| `app/study-plans/page.tsx` | create | Candidate plan list |
| `app/study-plans/[id]/page.tsx` | create | Candidate detail (renders StudyPlanTimeline) |
| `components/StudyPlanTimeline.tsx` | create | Client timeline component (weeks, step states, deep links, enroll/continue) |
| `app/api/admin/study-plans/route.ts` | create | GET/POST plans (requireAdmin) |
| `app/api/admin/study-plans/[id]/route.ts` | create | GET/PATCH/DELETE plan |
| `app/api/admin/study-plans/[id]/steps/route.ts` | create | POST step; PATCH/DELETE via step id |
| `app/api/admin/study-plans/steps/[stepId]/route.ts` | create | PATCH/DELETE a step |
| `app/admin/study-plans/page.tsx` | create | Admin CRUD UI |
| `app/admin/layout.tsx` | modify | Add "🗺️ Study Plans" sidebar link |
| `app/dashboard/page.tsx` | modify | Add Study Plans card link |
| `e2e/study-plans.spec.ts` | create | Enroll → detail → step-complete-after-attempt flow |

## Data Model Changes

```prisma
enum StudyPlanStepType {
  CHALLENGE_SET
  MOCK_SCORE
}

model StudyPlan {
  id          String     @id @default(cuid())
  examId      String
  exam        Exam       @relation(fields: [examId], references: [id], onDelete: Cascade)
  title       String
  description String
  steps       StudyPlanStep[]
  enrollments StudyPlanEnrollment[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model StudyPlanStep {
  id                 String            @id @default(cuid())
  planId             String
  plan               StudyPlan         @relation(fields: [planId], references: [id], onDelete: Cascade)
  order              Int
  title              String
  type               StudyPlanStepType
  challengeSetId     String?
  challengeSet       ChallengeSet?     @relation(fields: [challengeSetId], references: [id], onDelete: SetNull)
  mockScoreThreshold Int?
  dayOffset          Int               @default(0)
}

model StudyPlanEnrollment {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  planId    String
  plan      StudyPlan @relation(fields: [planId], references: [id], onDelete: Cascade)
  startedAt DateTime  @default(now())
  @@unique([userId, planId])
}
```
Back-relations added: `Exam.studyPlans`, `ChallengeSet.studyPlanSteps`, `User.studyPlanEnrollments`.

## API Changes

- `GET /api/study-plans` → `[{ id, title, examName, stepCount, enrolled, completionPct? }]`
- `POST /api/study-plans/[id]/enroll` → `{ enrollmentId }` (200; idempotent)
- `GET /api/study-plans/[id]/progress` → `{ id, title, examId, completedCount, totalSteps, completionPct, nextStep, steps:[{id,order,title,type,dayOffset,week,completed,link}] }`
- Admin: `/api/admin/study-plans` (GET/POST), `/api/admin/study-plans/[id]` (GET/PATCH/DELETE), `/api/admin/study-plans/steps/[stepId]` (PATCH/DELETE), `/api/admin/study-plans/[id]/steps` (POST) — all `requireAdmin`.

## Key Decisions

- **No completion table.** Completion derives from existing attempts — avoids write paths, stays consistent automatically, matches the readiness-computation approach already in `/api/progress`.
- **`onDelete: SetNull` on step→challengeSet** so deleting a challenge set doesn't cascade-delete plan steps; the step just renders as incomplete/orphaned (edge case guarded).
- **Shared `lib/studyPlan.ts`** so candidate progress API and any future dashboard integration share one derivation function.
- **50% pass threshold** for CHALLENGE_SET steps (consistent with existing gamification spirit); MOCK_SCORE thresholds are explicit per step.

## Risks & Mitigations

- **Migration on live DB** — additive tables only, no column drops → low risk. Standard `prisma migrate`.
- **Deep-link route shape drift** (`/mock-exam?examId=`) — verify actual mock route accepts examId during build; fall back to `/mock-exam` if not.
- **e2e flake** (known stale-server-on-3010 note) — reuse existing e2e login helper + server setup; don't spin a second server.
