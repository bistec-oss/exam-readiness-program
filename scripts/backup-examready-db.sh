#!/usr/bin/env bash
# backup-examready-db.sh — daily pg_dump from the exam-ready-db container.
# Used by cron (no_agent=True, deliver=local — silent on success).
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-$HOME/srv/exam-readiness/backups}"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
KEEP_DAYS="${KEEP_DAYS:-14}"

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

OUT="$BACKUP_DIR/examready-$TS.dump.gz"
podman exec exam-ready-db pg_dump -U examready -d examready --format=custom \
  | gzip > "$OUT"
chmod 600 "$OUT"

# Rotate
find "$BACKUP_DIR" -name 'examready-*.dump.gz' -mtime "+$KEEP_DAYS" -delete

# One line on stdout for local log inspection (silent on success when stdout is empty after cron delivery)
ls -lh "$OUT"
