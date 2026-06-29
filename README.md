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

## System Deploy — practice.tecbizsolutions.com (no Docker)

Use this when system Caddy and cloudflared are already installed on the server.
App runs on port **3847** as a systemd service.

### Architecture

```
Internet → cloudflared tunnel → Caddy (:80) → localhost:3847 (Next.js)
```

### 1. Clone the repo

```bash
git clone git@github.com:bistec-oss/exam-readiness-program.git /opt/exam-ready
```

### 2. One-time server setup (run as root)

```bash
cd /opt/exam-ready
bash scripts/setup-server.sh
```

This creates:
- PostgreSQL user + database `examready`
- System user `exam-ready`
- Systemd service `exam-ready.service`
- Caddy site block at `/etc/caddy/conf.d/practice.tecbizsolutions.com.conf`
- Env file template at `/etc/exam-ready.env`

### 3. Configure environment

```bash
sudo nano /etc/exam-ready.env
# Set DATABASE_URL password and confirm SESSION_SECRET
```

### 4. Configure cloudflared tunnel

In your existing tunnel, add a Public Hostname:
- **Hostname:** `practice.tecbizsolutions.com`
- **Service:** `http://localhost:80` (Caddy)

### 5. Deploy and seed

```bash
bash scripts/deploy.sh          # pull → install → migrate → build → restart
cd /opt/exam-ready/app && npm run db:seed   # first time only
```

**Yes, there is a DB seed.** It creates:
- The Claude Architect exam with 3 challenge sets and 20+ questions
- Demo accounts: `admin@bistecglobal.com` / `admin123!` and `candidate@bistecglobal.com` / `candidate123!`

### Re-deploy

```bash
cd /opt/exam-ready && bash scripts/deploy.sh
```

### Logs

```bash
journalctl -u exam-ready -f
```

---

## Running E2E Tests

```bash
cd app
npm run build && npm run start &   # or use existing server
npx playwright test
```

---

## Project Structure

```
.
├── app/                  Next.js application
│   ├── app/              App Router pages and API routes
│   ├── components/       Shared React components
│   ├── lib/              Server utilities (session, prisma, offlineQueue)
│   ├── prisma/           Schema and seed
│   └── e2e/              Playwright tests
├── docker-compose.yml
├── Caddyfile
└── .env.example
```
