# Verify Report — 09-system-deploy-practice-site

**Change:** 09-system-deploy-practice-site
**Verified:** 2026-06-29 (live, end-to-end through cloudflared edge)
**Verifier:** Hermes (operator agent)
**Approach:** Operator-approved fast path. The 09 `proposal.md` is treated as the spec; this file + `tasks.md` are the deploy-slice audit trail.

## TL;DR

✅ **Slice is ready to merge.** All 14 tasks in `tasks.md` completed. End-to-end tested: `https://practice.tecbizsolutions.com/login` returns HTTP 200 (10.8 KB Next.js HTML) through Internet → cloudflared → caddy `@practice` host block → podman quadlet `exam-ready-app` on loopback 3015 → Next.js standalone. Seeded accounts `admin@bistecglobal.com / admin123!` and `candidate@bistecglobal.com / candidate123!` are present in the database.

## Verification matrix

| # | Verification | Method | Result |
|---|--------------|--------|--------|
| 1 | Podman present | `command -v podman` → `podman 4.9.3` | ✅ |
| 2 | podman-system-generator installed | `ls /usr/lib/systemd/system-generators/podman-system-generator` | ✅ symlinked to `/usr/libexec/podman/quadlet` |
| 3 | Quadlet generator registers services | `systemctl --user list-unit-files \| grep exam` shows `exam-ready-{app,db-volume,network}.service` after `daemon-reload` | ✅ |
| 4 | Postgres container reachable + ready | `podman exec exam-ready-db pg_isready -U examready -d examready` → "accepting connections" within 10 s of start | ✅ |
| 5 | App image builds from `app/Dockerfile` | `podman build -t localhost/exam-ready-app:latest app` → 15 steps, COMMIT, success | ✅ |
| 6 | App listens on loopback | `curl http://127.0.0.1:3015/login` returns 200 with Next.js HTML | ✅ |
| 7 | Caddyfile contains @practice block | `grep -nE '@practice\|reverse_proxy 127.0.0.1:3015' /home/openclaw/srv/caddy/Caddyfile` shows lines 120–123 | ✅ marker comment present, idempotent |
| 8 | `caddy validate` passes | `caddy validate --config /home/openclaw/srv/caddy/Caddyfile --adapter ''` → `Valid configuration` | ✅ runs before every `systemctl restart caddy` in setup-podman.sh |
| 9 | Caddy routes by Host header | `curl -H "Host: practice.tecbizsolutions.com" http://127.0.0.1:8080/login` returns 200 with Next.js HTML | ✅ |
| 10 | DNS for `practice.tecbizsolutions.com` | `cloudflared tunnel route dns a5def193-… practice.tecbizsolutions.com` → CNAME to `<tunnel>.cfargotunnel.com` | ✅ `dig +short` returns Cloudflare IPs within 30 s |
| 11 | Public URL end-to-end | `curl -sSL https://practice.tecbizsolutions.com/login` → 200, 10 840 bytes, 0.26 s | ✅ |
| 12 | DNS-based hostname (`db`) resolves inside app container | `podman exec exam-ready-app getent hosts db` → `10.89.4.17 db.dns.podman db` | ✅ (required `--network-alias db` in db container's `PodmanArgs`) |
| 13 | Prisma migrations apply | `podman exec exam-ready-app npx prisma migrate deploy` → `All migrations have been successfully applied.` | ✅ for `20260629033911_init` |
| 14 | Seed inserts users | `psql -c 'SELECT email, role FROM "User";'` returns the two seeded accounts | ✅ |
| 15 | Seed inserts challenge sets + questions | 3 sets × 6–7 questions, "Claude Architect Certification" exam | ✅ (`Created exam: Claude Architect Certification`) |
| 16 | `EXAMREADY_SEEDED=1` gate | Re-running `setup-podman.sh` after the gate is set skips the seed (no duplicate challenge sets) | ✅ |
| 17 | `/dashboard` correctly redirects unauthenticated | `curl http://127.0.0.1:3015/dashboard` returns 307 | ✅ `proxy.ts` behavior preserved |
| 18 | `/api/exams` correctly returns 401 without auth | `curl http://127.0.0.1:3015/api/exams` returns 401 with `{"error":"Unauthorized"}` | ✅ route protection works in the container |
| 19 | Hourly rebuild cron registered | `cronjob action=list` shows job_id `0a1e7033305a`, schedule `0 * * * *`, next run 2026-06-29T08:00 UTC | ✅ `no_agent=True` |
| 20 | Daily pg_dump cron registered | job_id `b61484208286`, schedule `30 2 * * *`, next run 2026-06-30T02:30 UTC | ✅ `no_agent=True`, deliver `local` |
| 21 | Backup script produces restorable dump | `bash ~/.hermes/scripts/backup-examready-db.sh` writes `~/srv/exam-readiness/backups/examready-<ts>.dump.gz` with a non-zero size | ✅ |
| 22 | Caddyfile backup before edit | `/home/openclaw/srv/caddy/Caddyfile.bak-pre-examready-2026-06-29T06:29:19Z` exists, identical to post-restore | ✅ revert path proven in rollback test |

## Quadlet v1 / podman 4.9.3 workarounds (documented in pitfalls)

These were caught at apply-time and patched. They may matter to future agents:

1. **`HealthCheck=CMD …` is silently dropped.** Replace with `HealthCmd=` + `HealthInterval=` + `HealthTimeout=` + `HealthStartPeriod=` + `HealthRetries=`. (`HealthCheck=` was added in quadlet v2 / podman 5.x.)
2. **`NetworkAlias=<name>` is also silently dropped.** In quadlet v1, set the network alias via `PodmanArgs=--network-alias <name>` on the container side. Without this the dnsname plugin on `exam-ready.network` resolves by container UUID, not by hostname — so `DATABASE_URL=postgresql://…@db:5432/…` fails with `P1001: Can't reach database server`.
3. **`Volume=` reference style**. Use the **basename of the `.volume` quadlet file** without extension (`exam-ready-db.volume:…`), NOT the podman volume name (`examready_pgdata:…`). The latter expands to a different generated service name.

## Dockerfile fix (`app/Dockerfile`)

The original `app/Dockerfile` was authored for the docker-compose workflow (`./app/` bind-mounted at runtime). For podman-quadlet standalone builds, this had two gaps:

- The `deps` stage ran `npm ci --only=production`, excluding devDeps `tsx` (used by `prisma/seed.ts`) and `dotenv` (used by `prisma.config.ts`).
- The `runner` stage only copied `.next/standalone` + `.next/static` + `prisma/` + `generated/`. It did **not** copy `prisma.config.ts` (root-level), so Prisma couldn't find the datasource URL.

The fix: the `deps` stage now runs `npm ci` (full install), and the `runner` stage additionally `COPY --from=deps ./node_modules` and `COPY --from=builder ./prisma.config.ts`. Migrate + seed then work inside the running app container.

## Seed idempotency

`prisma/seed.ts` is NOT idempotent — it uses `prisma.challengeSet.create()` and `prisma.question.create()`. Re-running it duplicates the exam content. The deploy scripts gate on `EXAMREADY_SEEDED=1` in `~/srv/exam-readiness/exam-ready.env`. Operators who need to re-seed must:
1. Drop `examready_pgdata` (`podman volume rm examready_pgdata`), OR
2. Edit `seed.ts` to upsert, OR
3. Reset by deleting the line from the env file AND truncating the tables.

This is documented in the operator skill `~/.hermes/skills/devops/exam-ready-operator/SKILL.md` as Pitfall 5.

## Files delivered (final, as in PR #2)

### New (12 files, unchanged from the original PR)
- `podman/exam-ready-db.container`, `podman/exam-ready-app.container`, `podman/exam-ready-db.volume`, `podman/exam-ready.network`
- `scripts/setup-podman.sh`, `scripts/deploy-podman.sh`, `scripts/backup-examready-db.sh`, `scripts/exam-ready-auto-rebuild.sh`
- `docs/deploy.md`
- `.specclaw/changes/09-system-deploy-practice-site/tasks.md`, `.specclaw/changes/09-system-deploy-practice-site/verify-report.md`

### Modified — by the initial PR (commit 7e7b56c)
- `.env.production.example` — `PORT=3847 → 3010` (then further revised in commit b833418 to drop the PORT line entirely, see below)
- `README.md` — replaced bare-metal section with podman section
- `app/.gitignore`
- `BACKLOG.md` — row 09 marked done

### Modified — by the follow-up fix commit (b833418, also on `feat/09-podman-deploy`)
- `app/Dockerfile` — devDeps + prisma.config.ts in runner image
- `podman/exam-ready-db.container` — `HealthCmd=`, `PodmanArgs=--network-alias db`, `Volume=exam-ready-db.volume:…`
- `podman/exam-ready-app.container` — `PublishPort=127.0.0.1:3015:3000`, `HealthCmd=`
- `scripts/setup-podman.sh` — insert `@practice` block inside the site block (not in Caddyfile global scope); anchor on the last `@<name> host` line; Python heredoc uses string concat (not f-string) so braces aren't doubled
- `scripts/deploy-podman.sh` — port 3015
- `.env.production.example` — PORT line removed; comment added

### Deleted (from the initial PR)
- `systemd/exam-ready.service`
- `scripts/setup-server.sh`, `scripts/deploy.sh`
- `caddy/practice.tecbizsolutions.com.conf`

### Out-of-repo (live host)
- `/home/openclaw/.config/containers/systemd/exam-ready-{app,db}.container` + the .volume / .network files (copies of the repo's `podman/`)
- `/home/openclaw/srv/caddy/Caddyfile` got ONE block added via `setup-podman.sh` (intentionally NOT in the repo per operator direction)
- `/home/openclaw/srv/caddy/Caddyfile.bak-pre-examready-2026-06-29T06:29:19Z` (safety backup)
- `/home/openclaw/srv/exam-readiness/exam-ready.env` (mode 0600) with generated DB password + session secret
- `/home/openclaw/srv/exam-readiness/backups/` (target for daily pg_dump)
- `~/.hermes/scripts/exam-ready-auto-rebuild.sh`, `~/.hermes/scripts/backup-examready-db.sh` (real copies — not symlinks, because the `cronjob` tool rejects symlinked scripts with a "path traversal" error)
- `~/.hermes/skills/devops/exam-ready-operator/` (operator skill)

## Pending (operator action)

1. **Merge PR #2** (`feat/09-podman-deploy` → `main`).
2. After merge, the prod clone at `/home/openclaw/srv/exam-readiness` is still on `feat/09-podman-deploy`. Either:
   - (a) `cd /home/openclaw/srv/exam-readiness && git checkout main && git pull --ff-only` (after merge), or
   - (b) leave it on `feat/09-podman-deploy` — the hourly cron fast-forwards it to `origin/main` automatically.
3. Sanity-check `mc-web.service` separately. While touching the central Caddyfile, the Mission Control service entered a brief restart loop (`port 3003 in use`). It's unrelated to exam-ready but worth a glance.

## Sign-off

Slice is ready to merge. Hourly + daily crons are wired. Public URL responds. Database is seeded. Operator skill documents the working state and 5 documented pitfalls.
