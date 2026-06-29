# Bistec Global — Exam Readiness Program

Gamified exam readiness platform for professional certifications (Azure, AWS, Claude Architect, etc.).

## Features

- Exam catalog with challenge sets (flashcard-style)
- Timed mock exams with scoring and review
- Progress dashboard with readiness gauge, XP, and badges
- Admin panel for managing exams, challenges, and questions
- PWA — installable, works offline (queues attempts, syncs on reconnect)

## Tech Stack

Next.js 14 · Prisma · PostgreSQL · Tailwind CSS · Docker · Caddy · Cloudflare Tunnel

---

## Local Development

```bash
cp .env.example .env
# edit DATABASE_URL to point to your local Postgres
cd app
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

App runs on http://localhost:3000

Default accounts (seeded):
- Admin: `admin@bistecglobal.com` / `admin123!`
- Candidate: `candidate@bistecglobal.com` / `candidate123!`

---

## Production Deployment (Docker + Cloudflare Tunnel)

### Prerequisites

- Docker + Docker Compose
- A Cloudflare account with a domain
- A Cloudflare Tunnel token

### 1. Create Cloudflare Tunnel

```bash
cloudflared login
cloudflared tunnel create exam-ready
# Copy the token shown
```

In Cloudflare dashboard → Zero Trust → Tunnels → exam-ready → Public Hostnames:
- Add hostname: `exam.yourdomain.com` → Service: `http://caddy:80`

### 2. Configure environment

```bash
cp .env.example .env
# Set POSTGRES_PASSWORD, SESSION_SECRET, CLOUDFLARE_TUNNEL_TOKEN
```

Generate a strong session secret:
```bash
openssl rand -base64 32
```

### 3. Start services

```bash
docker compose up -d --build
```

### 4. Run migrations and seed

```bash
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed
```

### 5. Verify

The app is now accessible at `https://exam.yourdomain.com` (via Cloudflare Tunnel, TLS handled automatically).

---

## System Deploy — practice.tecbizsolutions.com (podman + system Caddy + cloudflared)

The app is deployed as two podman quadlets (`exam-ready-app`, `exam-ready-db`),
fronted by the existing host **Caddy** (loopback `:8080`) and **cloudflared**
(existing wildcard `*.tecbizsolutions.com`). No new Docker services on the host,
no in-host TLS, no per-app caddy config files.

Architecture:

```
Internet → cloudflared (*.tecbizsolutions.com wildcard)
  → caddy :8080 (Host: practice.tecbizsolutions.com → 127.0.0.1:3010)
    → podman quadlet exam-ready-app (Next.js standalone, port 3000 inside)
      → DATABASE_URL=postgresql://examready:***@db:5432/examready
    → podman quadlet exam-ready-db (postgres:16-alpine, volume examready_pgdata)
```

### Prerequisites (one-time on the host)

- podman (rootless) on PATH
- The existing Caddyfile at `/home/openclaw/srv/caddy/Caddyfile` (this server's central config; `setup-podman.sh` edits it)
- cloudflared running with the existing tunnel (no change needed — the `*.tecbizsolutions.com` wildcard already routes practice.* to caddy :8080)
- ~1 GB of disk for the postgres volume + image cache

### One-time setup

```bash
# 1. Clone the repo to the prod path
git clone --branch main --single-branch \
  https://github.com/bistec-oss/exam-readiness-program.git \
  ~/srv/exam-readiness

# 2. Run setup-podman.sh (idempotent, re-runnable)
cd ~/srv/exam-readiness
bash scripts/setup-podman.sh
```

`setup-podman.sh`:
- Generates `~/srv/exam-readiness/exam-ready.env` (mode 0600) with a fresh DB password and session secret
- Installs the four quadlet units to `~/.config/containers/systemd/`
- Inserts a `@practice host practice.tecbizsolutions.com` block into the central Caddyfile (skips if marker present)
- Validates the Caddyfile, restarts caddy
- Starts `exam-ready-db` and waits for `pg_isready`
- Builds the `exam-ready-app` image from `app/Dockerfile` and starts the container
- Runs `prisma migrate deploy`
- First-run-only: runs `prisma db seed` (gated by `EXAMREADY_SEEDED=1` in the env file)

### Re-deploy after pushing to main

Manual:
```bash
cd ~/srv/exam-readiness
bash scripts/deploy-podman.sh
```

Automated: an hourly `exam-ready auto-rebuild` cron watches the dev
checkout for new commits on `origin/main` and rebuilds the prod
clone. Silent on no changes.

### Backup & restore

```bash
# Manual backup (daily cron also runs this at 02:30 UTC, 14-day retention)
bash scripts/backup-examready-db.sh

# Restore
gunzip -c ~/srv/exam-readiness/backups/examready-<ts>.dump.gz \
  | podman exec -i exam-ready-db pg_restore -U examready -d examready --clean --if-exists
```

### Verifying the deploy

```bash
# Both quadlets active
systemctl --user is-active exam-ready-db exam-ready-app

# App reachable on loopback
curl -sS -o /dev/null -w "%{http_code}\n" --max-time 5 http://127.0.0.1:3010/login

# Caddy routes by Host header
curl -sS -o /dev/null -w "%{http_code}\n" -H "Host: practice.tecbizsolutions.com" \
  --max-time 5 http://127.0.0.1:8080/login

# End-to-end (slower, real TLS through cloudflared)
curl -sSL -o /dev/null -w "%{http_code} \u2192 %{url_effective}\n" \
  --max-time 15 https://practice.tecbizsolutions.com/login
```

A `307` is expected (the app's middleware redirects unauthenticated
requests to `/login`). A `000` at any step is a real outage.

### Seeded credentials (first-run only)

- Admin: `admin@bistecglobal.com` / `admin123!`
- Candidate: `candidate@bistecglobal.com` / `candidate123!`

See [`docs/deploy.md`](docs/deploy.md) for the longer operator notes
and the troubleshooting matrix (the operator skill
`~/.hermes/skills/devops/exam-ready-operator/SKILL.md` on the host is
the source of truth for ops).
