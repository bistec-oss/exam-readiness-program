#!/usr/bin/env bash
# exam-ready-auto-rebuild.sh — hourly watchdog for exam-ready production deploy.
# Same shape as ~/.hermes/skills/devops/mcd-operator/scripts/mc-auto-rebuild.sh:
# silent on no new commits on origin/main, rebuilds the prod clone when there are.
#
# Run by Hermes cron in no_agent=True mode (script IS the job).
# Cron config (filename only — cron resolves to ~/.hermes/scripts/):
#   schedule: "0 * * * *"
#   script:   exam-ready-auto-rebuild.sh
#   no_agent: true
#   deliver:  discord:<home-chat-id>
set -euo pipefail

DEV_REPO="${DEV_REPO:-$HOME/dev/exam-readiness-program}"
PROD_REPO="${PROD_REPO:-$HOME/srv/exam-readiness}"
REBUILD_SCRIPT="${REBUILD_SCRIPT:-$PROD_REPO/scripts/deploy-podman.sh}"

cd "$DEV_REPO"

# Safety gate 1: refuse non-main in dev
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
  echo "⏸ exam-ready: dev checkout is on '$BRANCH', not main — skipping"
  exit 0
fi

# Detect new commits
git fetch origin main --quiet
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
  # Silent on no changes (matches MC watchdog behavior)
  exit 0
fi

# New commits — surface them, then rebuild the prod clone with --force
NEW_COUNT=$(git log --oneline "$LOCAL..$REMOTE" | wc -l)
echo "🔔 exam-ready: $NEW_COUNT new commit(s) on origin/main, rebuilding…"
git log --oneline "$LOCAL..$REMOTE"

# Fast-forward the prod clone to origin/main so the prod rebuild runs against
# the same source of truth. (DEV push → CI/merge to main → pull propagates.)
cd "$PROD_REPO"
POP_STASH=0
if git status --porcelain | grep -q .; then
  echo "⚠️  prod clone dirty — auto-stashing before fast-forward"
  git stash push -u -m "exam-ready-auto-rebuild pre-ff @ $(date -u +%FT%TZ)"
  POP_STASH=1
  trap 'git stash pop >/dev/null 2>&1 || true' EXIT
fi
git fetch origin main --quiet
git checkout main --quiet
git merge --ff-only origin/main --quiet

# Rebuild
echo "==> $REBUILD_SCRIPT --force"
bash "$REBUILD_SCRIPT" --force --no-pull

# Stash pop on the way out
if [ "$POP_STASH" -eq 1 ]; then
  git stash pop >/dev/null 2>&1 && echo "popped stash" || echo "stash pop had conflicts — resolve manually in $PROD_REPO"
  trap - EXIT
fi
