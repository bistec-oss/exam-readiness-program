#!/usr/bin/env bash
# deploy.sh — pull latest, build, migrate, restart service
# Run from repo root as a user with sudo access for systemctl restart.
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_SUBDIR="$APP_DIR/app"

echo "==> Pulling latest..."
git -C "$APP_DIR" pull --ff-only

echo "==> Installing dependencies..."
cd "$APP_SUBDIR"
npm ci

echo "==> Generating Prisma client..."
npx prisma generate

echo "==> Running migrations..."
npx prisma migrate deploy

echo "==> Building..."
npm run build

echo "==> Restarting service..."
sudo systemctl restart exam-ready

echo "==> Waiting for service to come up..."
sleep 3
systemctl is-active --quiet exam-ready && echo "==> exam-ready is running ✓" || {
  echo "ERROR: exam-ready failed to start"
  journalctl -u exam-ready -n 30 --no-pager
  exit 1
}
