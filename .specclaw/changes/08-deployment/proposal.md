# Proposal: Docker + Caddy + Cloudflare Tunnel Deployment

**Created:** 2026-06-29
**Status:** 🟡 Draft

## Problem

App must be self-hosted on Bistec infrastructure, publicly accessible via Cloudflare Tunnel without opening firewall ports, with TLS handled automatically by Caddy.

## Proposed Solution

Docker Compose with three services: Next.js app, PostgreSQL, Caddy. Caddy reverse-proxies to Next.js and handles TLS. Cloudflare Tunnel (`cloudflared`) connects Caddy to a public Cloudflare hostname. README documents setup, seed, and tunnel token configuration.

## Scope

### In Scope
- `Dockerfile` for Next.js app (multi-stage, node:20-alpine)
- `docker-compose.yml` — services: `app` (Next.js), `db` (postgres:16), `caddy`
- `Caddyfile` — reverse proxy to `app:3000`
- `cloudflared` tunnel config (token via env var)
- `.env.example` with all required vars (DATABASE_URL, JWT_SECRET, CLOUDFLARE_TUNNEL_TOKEN, etc.)
- `README.md` — setup steps, `docker compose up`, seed command, Cloudflare Tunnel configuration
- Health check for postgres in compose

### Out of Scope
- CI/CD pipeline (post-MVP)
- Kubernetes / Helm (post-MVP)
- Multi-region

## Impact

- **Files affected:** 6–8
- **Complexity:** small
- **Risk:** low

## Open Questions

_None._

---

**To proceed:** Approve to begin planning.
