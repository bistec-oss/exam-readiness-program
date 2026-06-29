# Proposal: PWA Offline Support

**Created:** 2026-06-29
**Status:** 🟡 Draft

## Problem

Target users may have low or intermittent connectivity. App must be installable as PWA and allow candidates to complete challenge sets offline, syncing results when connectivity returns.

## Proposed Solution

`next-pwa` (Workbox) generates service worker from Next.js build. Static assets + question API responses cached. Challenge attempt answers stored in IndexedDB when offline; drained to `/api/attempts/sync` on reconnect. Offline indicator shown in UI.

## Scope

### In Scope
- `next-pwa` integration with Workbox (`StaleWhileRevalidate` for question API, `CacheFirst` for app shell)
- PWA manifest (name, icons, display standalone, theme color)
- IndexedDB offline attempt queue (`lib/offlineQueue.ts`)
- Sync on `navigator.online` event (`lib/syncAttempts.ts`)
- `POST /api/attempts/sync` — batch idempotent sync endpoint
- Offline indicator UI component
- App installable from browser (add-to-homescreen)

### Out of Scope
- Background sync API (Service Worker Sync API) — use online event for simplicity
- Offline mock exam (questions cached if previously loaded)

## Impact

- **Files affected:** 6–8
- **Complexity:** medium
- **Risk:** medium (IndexedDB + SW edge cases; mitigated by idempotency key)

## Open Questions

_None._

---

**To proceed:** Approve to begin planning.
