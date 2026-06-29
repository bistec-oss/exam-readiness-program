# Exam-Readiness — System Deploy (Podman)

Production deploy of **bistec-oss/exam-readiness-program** to
**practice.tecbizsolutions.com** on this server. Runs as two
**podman quadlets** (`exam-ready-app`, `exam-ready-db`), fronted by the
existing host **Caddy** (`@practice` host block on loopback :8080) and
**cloudflared** (existing wildcard route `*.tecbizsolutions.com`).

This replaces the earlier bare-metal systemd plan that shipped in the
[08-deployment](../08-deployment/proposal.md) change. The 09
proposal stays the source of truth — this doc just describes the
actual mechanics.

## Architecture

```
Internet
  │   *.tecbizsolutions.com
  ▼
cloudflared (host)
  │   http://127.0.0.1:8080
  ▼
caddy (host, loopback :8080)
  │   matcher @practice → 127.0.0.1:3010
  ▼
podman quadlet exam-ready-app (Next.js standalone, port 3010 host / 3000 container)
  │   DATABASE_URL=postgresql://examready:***@db:5432/examready
  ▼
podman quadlet exam-ready-db (postgres:16-alpine)
      volume examready_pgdata
```

Both containers are on podman network `exam-ready-net`. Only the app
publishes a host port (`127.0.0.1:3010` → container `3000`). The db is
in-network only.

## Files & layout

| Path | Role |
|------|------|
| `~/srv/exam-readiness/` | **Prod clone** of this repo. Pinned to `main` post-merge. Image is built from `app/Dockerfile` here. |
| `~/srv/exam-readiness/exam-ready.env` | Production secrets (mode `0600`). `DATABASE_URL`, `SESSION_SECRET`, `POSTGRES_PASSWORD`, `EXAMREADY_SEEDED`. |
| `~/srv/exam-readiness/backups/` | Daily pg_dump target. 14-day retention. |
| `~/.config/containers/systemd/exam-ready-{db,app}.container` | Podman quadlets (copied here from `podman/` by `setup-podman.sh`) |
| `~/.config/containers/systemd/exam-ready-db.volume` | Named volume `examready_pgdata` |
| `~/.config/containers/systemd/exam-ready.network` | Internal network `exam-ready-net` |
| `/home/openclaw/srv/caddy/Caddyfile` | The host Caddyfile. `setup-podman.sh` inserts a `@practice host practice.tecbizsolutions.com` block. |

## One-time setup

```bash
# As openclaw (rootless podman)
cd ~/srv/exam-readiness
bash scripts/setup-podman.sh
```

Idempotent: re-run after repo changes to refresh quadlets, env, or
Caddyfile without disturbing the running service.

## Re-deploy after a push to main

Manual:
```bash
cd ~/srv/exam-readiness
bash scripts/deploy-podman.sh
```

Automated: the `exam-ready auto-rebuild (hourly)` cron job fires at
the top of every hour (UTC), detects new commits on `origin/main`,
and invokes `deploy-podman.sh --force` against the prod clone. Silent
when there are no new commits.

## Backup & restore

```bash
# Manual backup
bash scripts/backup-examready-db.sh

# Automated: `exam-ready pg_dump (daily)` cron at 02:30 UTC, deliver=local

# Restore
gunzip -c ~/srv/exam-readiness/backups/examready-YYYYMMDDTHHMMSSZ.dump.gz \
  | podman exec -i exam-ready-db pg_restore -U examready -d examready --clean --if-exists
```

## Verifying the deploy

```bash
# Both quadlets active
systemctl --user is-active exam-ready-db exam-ready-app

# App reachable on loopback
curl -sS -o /dev/null -w "%{http_code}\n" --max-time 5 http://127.0.0.1:3010/login

# Caddy routes by Host header
curl -sS -o /dev/null -w "%{http_code}\n" -H "Host: practice.tecbizsolutions.com" \
  --max-time 5 http://127.0.0.1:8080/login

# End-to-end (slower, real TLS)
curl -sSL -o /dev/null -w "%{http_code}\n" --max-time 15 \
  https://practice.tecbizsolutions.com/login
```

A `307` is expected (the app's `proxy.ts` redirects unauthenticated
requests to `/login`). A `000` at any step is a real outage — see the
operator skill `exam-ready-operator` for the troubleshooting matrix.

## Seeded credentials (first-run only)

- Admin: `admin@bistecglobal.com` / `admin123!`
- Candidate: `candidate@bistecglobal.com` / `candidate123!`

Password reset is on the backlog (post-MVP: "User management
(admin) → invite, suspend, role-change").

## What this slice does NOT include

- HTTPS termination on the host — that's cloudflared's job at the edge.
- A CI pipeline — pushes to `main` propagate via the hourly cron (or manually with `deploy-podman.sh`).
- Per-user password reset / invite flow — backed in for post-MVP.
- Multi-region / load balancing — single VPS, single-tenant.
