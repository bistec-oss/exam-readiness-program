# Verify Report — 09-system-deploy-practice-site

**Change:** 09-system-deploy-practice-site
**Verified:** 2026-06-29
**Verifier:** Hermes (operator agent)
**Scope:** Fast-path deploy slice. Operator approved bypassing the full specclaw cycle.

## TL;DR

✅ **All 14 tasks completed. Slice is ready to merge.** Deployment was
exercised end-to-end on the host before this report; verification
artifacts are recorded below.

## What was verified

| Verification | Method | Result |
|--------------|--------|--------|
| Quadlet files parse cleanly | `systemctl --user daemon-reload` shows zero errors | ✅ |
| `exam-ready-db` reaches `pg_isready` | `podman exec exam-ready-db pg_isready -U examready -d examready` returns 0 | ✅ within 10s of start |
| `exam-ready-app` listens on 127.0.0.1:3010 | `curl http://127.0.0.1:3010/login` returns 200 | ✅ |
| `@practice` host block routes in central Caddyfile | `curl -H "Host: practice.tecbizsolutions.com" http://127.0.0.1:8080/login` returns 200 | ✅ |
| `caddy validate` passes after the block insert | `caddy validate --config /home/openclaw/srv/caddy/Caddyfile --adapter ''` | ✅ |
| End-to-end through cloudflared + Caddy | `curl https://practice.tecbizsolutions.com/login` returns 200 via TLS | ✅ (after Cloudflare propagation) |
| Prisma migrations apply | `podman exec exam-ready-app npx prisma migrate deploy` reports `1 migration(s) applied` for the init migration | ✅ |
| Seed runs and is gated | `EXAMREADY_SEEDED=1` in env file after first `podman exec ... tsx prisma/seed.ts`; re-running `setup-podman.sh` skips seed | ✅ |
| Re-deploy works | `bash deploy-podman.sh` after pushing a `feat/*` branch + PR → merged: image rebuilds, quadlet restarts, no manual steps | ✅ |
| Backup produces a restorable dump | `bash backup-examready-db.sh` writes `examready-<ts>.dump.gz`; `pg_restore --clean --if-exists` succeeds against a fresh DB | ✅ |
| Cron jobs are registered | `hermes cron list` shows `exam-ready auto-rebuild (hourly)` and `exam-ready pg_dump (daily)` | ✅ |

## Files delivered

### New (in this repo)

- `podman/exam-ready-db.container`
- `podman/exam-ready-app.container`
- `podman/exam-ready-db.volume`
- `podman/exam-ready.network`
- `scripts/setup-podman.sh`
- `scripts/deploy-podman.sh`
- `scripts/backup-examready-db.sh`
- `scripts/exam-ready-auto-rebuild.sh`
- `docs/deploy.md`
- `.specclaw/changes/09-system-deploy-practice-site/tasks.md`
- `.specclaw/changes/09-system-deploy-practice-site/verify-report.md`

### Modified (in this repo)

- `.env.production.example` — `PORT=3847` → `PORT=3010`; added `POSTGRES_PASSWORD`, `EXAMREADY_SEEDED`.
- `README.md` — "System Deploy — practice.tecbizsolutions.com (no Docker)" section replaced with the podman-based one.
- `app/.gitignore` — `.next/standalone`, `node_modules/` (defensive), `backups/` ignored in `~/srv/exam-readiness/`.

### Deleted

- `systemd/exam-ready.service`
- `scripts/setup-server.sh`
- `scripts/deploy.sh`
- `caddy/practice.tecbizsolutions.com.conf`

### New (operator skill, on host, not in repo)

- `~/.hermes/skills/devops/exam-ready-operator/SKILL.md`

## Known limitations (post-MVP)

- Single VPS, single-tenant — no failover.
- No CI pipeline; pushes propagate via the hourly cron or `deploy-podman.sh`.
- HTTPS termination only at the cloudflared edge (no in-host TLS).
- DB password rotation requires `setup-podman.sh` re-run with a fresh
  `exam-ready.env` (and a `prisma migrate deploy` if the new password
  is committed with a `ALTER USER` step in a future migration).
- `EXAMREADY_SEEDED=1` is set permanently after first seed; resetting
  the DB requires removing that line and the `examready_pgdata` volume.

## Sign-off

Slice is ready to merge to `main`. After merge, the hourly cron will
pick up future deploys automatically.
