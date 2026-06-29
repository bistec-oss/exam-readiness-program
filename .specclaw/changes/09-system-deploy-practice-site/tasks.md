# Tasks — 09-system-deploy-practice-site

**Change:** 09-system-deploy-practice-site
**Approach:** Fast path (operator-approved bypass of full specclaw cycle for deploy-skeleton-only slice). The 09 `proposal.md` is treated as the spec; this file lists the deployment-slice tasks; `verify-report.md` records the verification outcome.

## Task list

| # | Task | Status | Wave | Notes |
|---|------|--------|------|-------|
| 1 | Write podman quadlet units (`exam-ready-db.container`, `exam-ready-app.container`, `exam-ready-db.volume`, `exam-ready.network`) | ✅ Done | 1 | Mirror MC's `systemd/` layout. App container: `PublishPort=127.0.0.1:3010:3000`. |
| 2 | Wire `EnvironmentFile=%h/srv/exam-readiness/exam-ready.env` so secrets stay off disk in version control | ✅ Done | 1 | Both quadlets. |
| 3 | `scripts/setup-podman.sh` — one-time / idempotent setup (env, quadlets, caddy, db, image, app, migrate, seed-gate) | ✅ Done | 1 | Single entrypoint. Re-runnable. |
| 4 | `scripts/deploy-podman.sh` — re-deploy on push to main. Branch/dirty gates, image-preservation, prune non-prod built images | ✅ Done | 2 | Same shape as `mcd-operator/scripts/mc-rebuild.sh`. |
| 5 | `scripts/backup-examready-db.sh` — daily pg_dump with 14-day rotation | ✅ Done | 2 | Wired into a daily cron (deliver=local). |
| 6 | `scripts/exam-ready-auto-rebuild.sh` — hourly watchdog detecting new commits on origin/main | ✅ Done | 3 | Mirrors `mc-auto-rebuild.sh`. Cron runs in `no_agent=True` mode. |
| 7 | Insert `@practice` host block into the central `/home/openclaw/srv/caddy/Caddyfile` (no per-app `.conf` files) | ✅ Done | 1 | Idempotent via marker comment. `setup-podman.sh` runs `caddy validate` before restart. |
| 8 | No cloudflared config edit — existing wildcard `*.tecbizsolutions.com → :8080` already covers `practice.*` | ✅ Done (n/a) | — | Verified pre-change in `~/.cloudflared/config.yml` — the wildcard is the LAST ingress rule before the 404 catch-all, with nothing more specific for `practice.` ahead of it. |
| 9 | Delete `systemd/exam-ready.service`, `scripts/setup-server.sh`, `scripts/deploy.sh`, `caddy/practice.tecbizsolutions.com.conf` (bare-metal artifacts replaced by podman path) | ✅ Done | 1 | Repo-level cleanup, not just host-level. |
| 10 | Update `.env.production.example` to use `PORT=3010` and the podman-internal `DATABASE_URL`; document `POSTGRES_PASSWORD` | ✅ Done | 1 | Old env said `PORT=3847`, which only matched the old bare-metal plan. |
| 11 | Update `README.md` deploy section (replace the "System Deploy — practice.tecbizsolutions.com (no Docker)" section with the podman one) | ✅ Done | 2 | Single source of truth for setup, redeploy, backup, restore. |
| 12 | Add row 09 to `BACKLOG.md` and mark ✅ Done | ✅ Done | 2 | Reads "moved to podman quadlets + existing host caddy / cloudflared." |
| 13 | Hourly rebuild cron + daily backup cron registered via Hermes cron | ✅ Done | 3 | `exam-ready auto-rebuild (hourly)` and `exam-ready pg_dump (daily)`. |
| 14 | Operator skill `~/.hermes/skills/devops/exam-ready-operator/SKILL.md` written | ✅ Done | 3 | Includes hourly + daily cron setup, troubleshooting matrix, pitfalls. |

## Waves

- **Wave 1 (foundation) — tasks 1, 2, 3, 7, 8, 9, 10**: podman quadlets + scripts + caddy integration + cleanup of bare-metal artifacts.
- **Wave 2 (lifecycle) — tasks 4, 5, 11, 12**: re-deploy + backup scripts, README + BACKLOG updates.
- **Wave 3 (automation) — tasks 6, 13, 14**: hourly rebuild + daily backup crons, operator skill.

Each wave builds on the last. Wave 1 alone gets you a working
`practice.tecbizsolutions.com`. Wave 2 makes re-deploy safe. Wave 3
makes the deploy self-healing.

## Out of scope (post-MVP backlog)

- Per-user password reset + admin invite flow.
- Container image signing / supply-chain security (cosign, SBOM).
- Per-request tracing via OpenTelemetry → Mission Control dashboard.
- Multi-region / active-active failover (currently single VPS, single podman host).
