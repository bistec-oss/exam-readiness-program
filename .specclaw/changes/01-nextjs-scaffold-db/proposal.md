# Proposal: Next.js Project Scaffold + DB Schema

**Created:** 2026-06-29
**Status:** 🟡 Draft

## Problem

Need a solid foundation: Next.js 14 App Router project with Prisma + PostgreSQL, Tailwind CSS, and Claude Architect seed questions to unblock all other implementation proposals.

## Proposed Solution

Scaffold monorepo-style Next.js app. Define full Prisma schema for all entities (User, Exam, ChallengeSet, Question, Attempt, MockAttempt). Run initial migration. Seed ≥ 20 Claude Architect questions across ≥ 3 challenge sets.

## Scope

### In Scope
- Next.js 14 App Router project init (TypeScript + Tailwind CSS + ESLint)
- Prisma ORM setup with PostgreSQL adapter
- Full DB schema (User, Exam, ChallengeSet, Question, Attempt, MockAttempt)
- Initial migration
- Seed script: Claude Architect exam + ≥ 20 questions across ≥ 3 challenge sets
- `docker-compose.yml` with postgres service for local dev
- `.env.example` with required vars

### Out of Scope
- Any UI pages or API routes (handled in later proposals)
- Auth setup (02-auth-roles)

## Impact

- **Files affected:** 10–15
- **Complexity:** medium
- **Risk:** low

## Open Questions

_None — all resolved._

---

**To proceed:** Approve to begin planning.
