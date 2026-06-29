# Proposal: Team/Cohort Manager View

## Summary
Allow admins to create cohorts (teams), add members, and view aggregate readiness stats per cohort — e.g. "8/10 team members ≥ 80% ready".

## Problem
No way to group learners by team/cohort or see collective exam readiness for a group.

## Solution
- `Cohort` model: id, name, code (unique join code), createdAt
- `CohortMember` model: cohortId, userId, joinedAt
- Admin UI at `/admin/cohorts`: create cohorts, add members
- Cohort detail page: member table with per-user readiness %, badge showing "N/total ≥ 80% ready"

## Scope
- DB migration: two new tables
- API: CRUD cohorts, add/remove members, get cohort stats
- UI: list + detail pages (admin only)
- E2E: cohort creation, member management, readiness stats display
