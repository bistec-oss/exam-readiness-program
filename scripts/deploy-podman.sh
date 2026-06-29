#!/usr/bin/env bash
# deploy-podman.sh — rebuild + redeploy the exam-ready app container
#
# Pulls latest main, rebuilds the podman image in place, restarts the
# quadlet, applies pending prisma migrations, and re-seeds only if the
# gate EXAMREADY_SEEDED is unset. Mirrors the safety guards in
# ~/.hermes/skills/devops/mcd-operator/scripts/mc-rebuild.sh.
#
# Usage:
#   bash deploy-podman.sh                # full pull + rebuild + restart + migrate
#   bash deploy-podman.sh --no-pull      # rebuild from current workdir only
#   bash deploy-podman.sh --force        # auto-stash dirty edits in prod clone
#
# Environment overrides:
#   REPO_DIR                prod clone path  (default: ~/srv/exam-readiness)
#   EXAMREADY_APP_IMAGE     tag to build    (default: localhost/exam-ready-app:latest)
set -euo pipefail

REPO_DIR="${REPO_DIR:-$HOME/srv/exam-readiness}"
APP_IMAGE="${EXAMREADY_APP_IMAGE:-localhost/exam-ready-app:latest}"
APP_PORT="${APP_PORT:-3010}"
DB_NAME="examready"
ENV_FILE="$REPO_DIR/exam-ready.env"

PULL=1
FORCE=0
for arg in "$@"; do
  case "$arg" in
    --no-pull) PULL=0 ;;
    --force)   FORCE=1 ;;
    -h|--help)
      sed -n '2,20p' "$0"; exit 0 ;;
    *) echo "unknown flag: $arg" >&2; exit 64 ;;
  esac
done

cd "$REPO_DIR"

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
ok()   { printf '  \033[32m✓\033[0m %s\n' "$*"; }
warn() { printf '  \033[33m!\033[0m %s\n' "$*"; }
err()  { printf '  \033[31m✗\033[0m %s\n' "$*" >&2; }

# ── Branch safety ────────────────────────────────────────────────────────────
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
  err "on '$BRANCH', not main — refusing to deploy"
  exit 1
fi

# ── Dirty workdir handling ───────────────────────────────────────────────────
POP_STASH=0
if ! git diff --quiet HEAD 2>/dev/null || ! git diff --cached --quiet HEAD 2>/dev/null || [ -n "$(git ls-files --others --exclude-standard 2>/dev/null)" ]; then
  if [ "$FORCE" -eq 1 ]; then
    warn "dirty workdir — auto-stashing (--force)"
    git stash push -u -m "deploy-podman auto-stash @ $(date -u +%FT%TZ)"
    POP_STASH=1
    trap 'git stash pop >/dev/null 2>&1 || true' EXIT
  else
    err "workdir is dirty — commit/stash first or pass --force"
    exit 1
  fi
fi

# ── Pull ─────────────────────────────────────────────────────────────────────
if [ "$PULL" -eq 1 ]; then
  bold "==> Pulling origin/main"
  git fetch origin main --quiet
  LOCAL=$(git rev-parse HEAD)
  REMOTE=$(git rev-parse origin/main)
  if [ "$LOCAL" = "$REMOTE" ] && [ "$FORCE" -eq 0 ]; then
    ok "up to date (HEAD = origin/main = ${LOCAL:0:9})"
    bold "==> Skipping rebuild — nothing to do"
    exit 0
  fi
  git pull --ff-only
  ok "pulled: $(git log --oneline -1)"
fi

# ── Build image in place (never --rm before; preserve last-known-good) ─────
bold "==> Building app image ($APP_IMAGE)"
podman build -t "$APP_IMAGE" "$REPO_DIR/app"
ok "image rebuilt"

# Sanity: image exists
if ! podman image exists "$APP_IMAGE"; then
  err "image $APP_IMAGE not present after build — aborting restart"
  exit 1
fi

# ── Restart quadlet ─────────────────────────────────────────────────────────
bold "==> Restarting exam-ready-app.service"
systemctl --user restart exam-ready-app.service
ok "restart issued"

# Wait for app to come up
for i in $(seq 1 30); do
  CODE=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 2 "http://127.0.0.1:$APP_PORT/login" 2>/dev/null || echo 000)
  if echo "$CODE" | grep -qE '^(200|307)$'; then
    ok "app is responding (HTTP $CODE) after ${i}s"
    break
  fi
  sleep 1
  if [ "$i" = "30" ]; then
    err "app did not become ready in 30s after restart"
    podman logs exam-ready-app 2>&1 | tail -40 || true
    exit 1
  fi
done

# ── Migrate ──────────────────────────────────────────────────────────────────
bold "==> Applying pending prisma migrations"
podman exec exam-ready-app npx prisma migrate deploy
ok "migrations applied"

# ── Seed gate ────────────────────────────────────────────────────────────────
if [ -f "$ENV_FILE" ] && [ "$(grep -E '^EXAMREADY_SEEDED=' "$ENV_FILE" | cut -d= -f2- || echo '')" != "1" ]; then
  bold "==> First-run seed (EXAMREADY_SEEDED is unset)"
  podman exec exam-ready-app npx tsx prisma/seed.ts
  echo "EXAMREADY_SEEDED=1" >> "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  ok "seeded demo accounts"
fi

# ── Stash pop on the way out ────────────────────────────────────────────────
if [ "$POP_STASH" -eq 1 ]; then
  git stash pop >/dev/null 2>&1 && ok "popped stash" || warn "stash pop had conflicts — resolve manually in $REPO_DIR"
  trap - EXIT
fi

bold ""
ok "Deploy complete"
