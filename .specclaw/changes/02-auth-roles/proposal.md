# Proposal: Authentication & Role-Based Access

**Created:** 2026-06-29
**Status:** 🟡 Draft

## Problem

App needs secure auth with two roles (admin, candidate). JWT in httpOnly cookies prevents XSS theft. Silent refresh keeps sessions alive without re-login friction.

## Proposed Solution

Next.js API routes for register/login/logout/refresh. JWT access token (15min) + refresh token (7 days) stored in httpOnly cookies. Middleware guards protected routes by role. AuthContext provides session state to client components.

## Scope

### In Scope
- `POST /api/auth/register` — email + password, role defaults to CANDIDATE
- `POST /api/auth/login` — returns access + refresh JWT cookies
- `POST /api/auth/refresh` — silent token refresh
- `POST /api/auth/logout` — clears cookies
- Next.js middleware for route protection (redirect to `/login` if unauth)
- Role guard: admin routes return 403 for CANDIDATE
- Login/register page UI (mobile-first, cartoony)
- AuthContext (React context for client-side session state)
- bcrypt password hashing (cost 12)

### Out of Scope
- Social/OAuth login
- Email verification
- Password reset flow

## Impact

- **Files affected:** 8–12
- **Complexity:** medium
- **Risk:** low

## Open Questions

_None._

---

**To proceed:** Approve to begin planning.
