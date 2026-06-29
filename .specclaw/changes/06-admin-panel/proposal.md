# Proposal: Admin Panel (Exam / Challenge / Question Management)

**Created:** 2026-06-29
**Status:** 🟡 Draft

## Problem

Admins need to manage exam content — create new exams, add challenge sets, write/edit questions — without touching the database directly.

## Proposed Solution

Admin section at `/admin` (role-gated to ADMIN). Pages for managing exams, challenge sets, and questions via CRUD forms. Table list + modal/drawer edit pattern. All backed by admin API routes.

## Scope

### In Scope
- Admin layout with sidebar nav (route-gated: 403 for CANDIDATE)
- Exam management (`/admin/exams`) — create/edit/delete exams
- Challenge set management (`/admin/challenges`) — create/edit/delete, assign to exam
- Question editor (`/admin/questions`) — create/edit/delete, MCQ + true/false, options + correct answer + explanation, assign to challenge set
- Admin API routes: `GET/POST/PUT/DELETE /api/admin/exams`, `/challenges`, `/questions`
- Validation: ≥ 2 options per question, correct option must be one of options

### Out of Scope
- CSV bulk import (post-MVP)
- User management (post-MVP)
- Content moderation / review workflow

## Impact

- **Files affected:** 10–14
- **Complexity:** medium
- **Risk:** low

## Open Questions

_None._

---

**To proceed:** Approve to begin planning.
