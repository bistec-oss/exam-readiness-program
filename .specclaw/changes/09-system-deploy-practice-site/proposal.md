# Proposal: System Deploy — practice.tecbizsolutions.com

**Created:** 2026-06-29
**Status:** 🟡 Draft

## Problem

The app exists as a codebase but is not publicly accessible. Stakeholders and learners need a live URL to evaluate and use the platform. Running via Docker adds unnecessary overhead on a single server where system Caddy and cloudflared are already available.

## Proposed Solution

Deploy the Next.js app directly on this server (bare-metal / VM) using:

1. **PostgreSQL** — system Postgres instance, dedicated `examready` database + user
2. **Next.js app** — production build (`npm run build && npm run start`), managed as a `systemd` service (`exam-ready.service`) on port 3000
3. **Caddy** — system Caddy reverse-proxies `practice.tecbizsolutions.com → localhost:3000`
4. **cloudflared** — system cloudflared tunnel connects `practice.tecbizsolutions.com` to Caddy, no open firewall ports required

Migrations and seed run once on first deploy. App auto-restarts on crash via systemd.

## Scope

### In Scope
- `scripts/deploy.sh` — idempotent deploy script: pull, install, migrate, build, reload service
- `scripts/setup-server.sh` — one-time server setup: create DB user/database, create systemd unit, configure Caddy vhost, configure cloudflared tunnel
- `systemd/exam-ready.service` — unit file (WorkingDirectory, EnvironmentFile, ExecStart, Restart=always)
- `/etc/caddy/conf.d/practice.tecbizsolutions.com` (or site block) — reverse proxy config
- `.env.production.example` — production env vars template (DATABASE_URL, SESSION_SECRET)
- `README.md` update — server setup + deploy steps
- BACKLOG.md update — add item 09

### Out of Scope
- Docker (this deploy uses system services, not containers)
- CI/CD pipeline (manual deploy script for now)
- SSL cert management (Cloudflare Tunnel handles TLS termination at edge; Caddy serves HTTP internally)
- Multi-server / load balancing

## Impact

- **Files affected:** 5–7 new files, 1 updated (README.md)
- **Complexity:** small
- **Risk:** low — isolated to infra scripts; no app code changes

## Open Questions

1. What is the cloudflared tunnel name / token for `practice.tecbizsolutions.com`? (Required to configure the tunnel route.)
2. Is Postgres already running on this server, or does it need to be installed?
3. What OS / distro? (Affects Caddy config path and systemd conventions.)

---

**To proceed:** Review this proposal and approve to begin planning.
