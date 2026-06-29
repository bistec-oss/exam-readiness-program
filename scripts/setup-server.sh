#!/usr/bin/env bash
# setup-server.sh — one-time server setup for exam-ready app
# Run as root (or with sudo). Idempotent.
set -euo pipefail

APP_PORT=3847
APP_DIR="/opt/exam-ready"
APP_USER="exam-ready"
DOMAIN="practice.tecbizsolutions.com"
DB_NAME="examready"
DB_USER="examready"
ENV_FILE="/etc/exam-ready.env"

echo "==> Creating system user..."
id "$APP_USER" &>/dev/null || useradd --system --shell /bin/false --home "$APP_DIR" "$APP_USER"

echo "==> Creating app directory..."
mkdir -p "$APP_DIR"
chown "$APP_USER:$APP_USER" "$APP_DIR"

echo "==> Setting up PostgreSQL database..."
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$(openssl rand -base64 24)';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

echo ""
echo "==> IMPORTANT: Set the DB password in $ENV_FILE"
echo "    sudo -u postgres psql -c \"ALTER USER $DB_USER WITH PASSWORD 'your_strong_password';\""
echo "    Then update DATABASE_URL in $ENV_FILE accordingly."
echo ""

echo "==> Creating env file template at $ENV_FILE..."
if [ ! -f "$ENV_FILE" ]; then
  cat > "$ENV_FILE" <<EOF
NODE_ENV=production
PORT=$APP_PORT
DATABASE_URL=postgresql://$DB_USER:CHANGE_ME@localhost:5432/$DB_NAME
SESSION_SECRET=$(openssl rand -base64 32)
EOF
  chmod 640 "$ENV_FILE"
  chown root:"$APP_USER" "$ENV_FILE"
  echo "    Created $ENV_FILE — edit DATABASE_URL password before starting the service."
else
  echo "    $ENV_FILE already exists, skipping."
fi

echo "==> Installing systemd service..."
cp "$(dirname "$0")/../systemd/exam-ready.service" /etc/systemd/system/exam-ready.service
systemctl daemon-reload
systemctl enable exam-ready

echo "==> Configuring Caddy..."
CADDY_CONF_DIR="/etc/caddy/conf.d"
mkdir -p "$CADDY_CONF_DIR"
cat > "$CADDY_CONF_DIR/$DOMAIN.conf" <<EOF
$DOMAIN {
    reverse_proxy localhost:$APP_PORT
}
EOF
# Reload Caddy if running
systemctl is-active --quiet caddy && systemctl reload caddy || true

echo ""
echo "==> cloudflared: add a Public Hostname to your existing tunnel:"
echo "    Hostname : $DOMAIN"
echo "    Service  : http://localhost:80   (Caddy will forward to the app)"
echo ""
echo "==> Setup complete. Next steps:"
echo "    1. Edit DATABASE_URL in $ENV_FILE"
echo "    2. Clone the repo to $APP_DIR and run: bash scripts/deploy.sh"
echo "    3. Run the DB seed: cd $APP_DIR/app && npm run db:seed"
