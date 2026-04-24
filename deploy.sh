#!/bin/bash

# ==============================================================================
# AMP Deployment Script (Systemd Version)
# Based on template provided by user.
# ==============================================================================

# Configuration
WEB_PORT=2027
API_PORT=6333
APP_NAME="amp"
PROJECT_DIR=$(pwd)
USER_NAME=$(whoami)

# Subdirectories
FRONTEND_DIR="$PROJECT_DIR/Src/Frontend/amp"
BACKEND_DIR="$PROJECT_DIR/Src/Backend"

echo "--- Starting Deployment for $APP_NAME ---"

# 1. Setup Backend
echo "[1/4] Setting up Backend..."
cd "$BACKEND_DIR" || exit
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
echo "Installing Python dependencies..."
pip install -r requirements.txt
export FLASK_APP=app.py
echo "Updating database schema..."
flask db upgrade || echo "No migrations to apply or already applied."
deactivate

# 2. Setup Frontend
echo -e "\n[2/4] Setting up Frontend..."
cd "$FRONTEND_DIR" || exit
echo "Installing Node dependencies and adapter-node..."
npm install -D @sveltejs/adapter-node
npm install
echo "Building the application..."
npm run build

# 3. Create Systemd Services
echo -e "\n[3/4] Setting up systemd services for autostart..."

# Backend Service
BACKEND_SERVICE="/etc/systemd/system/$APP_NAME-api.service"
echo "Creating $BACKEND_SERVICE..."
sudo bash -c "cat > $BACKEND_SERVICE" <<EOF
[Unit]
Description=AMP Backend - API
After=network.target

[Service]
Type=simple
User=$USER_NAME
WorkingDirectory=$BACKEND_DIR
Environment=FLASK_APP=app.py
Environment=PORT=$API_PORT
ExecStart=$BACKEND_DIR/venv/bin/python app.py
Restart=always
StandardOutput=append:$BACKEND_DIR/server.log
StandardError=append:$BACKEND_DIR/server.log

[Install]
WantedBy=multi-user.target
EOF

# Frontend Service
FRONTEND_SERVICE="/etc/systemd/system/$APP_NAME-web.service"
echo "Creating $FRONTEND_SERVICE..."
sudo bash -c "cat > $FRONTEND_SERVICE" <<EOF
[Unit]
Description=AMP Frontend - SvelteKit
After=network.target

[Service]
Type=simple
User=$USER_NAME
WorkingDirectory=$FRONTEND_DIR
Environment=NODE_ENV=production
Environment=PORT=$WEB_PORT
Environment=HOST=0.0.0.0
ExecStart=/usr/bin/node build/index.js
Restart=always
StandardOutput=append:$FRONTEND_DIR/server.log
StandardError=append:$FRONTEND_DIR/server.log

[Install]
WantedBy=multi-user.target
EOF

# 4. Enable and Restart Services
echo -e "\n[4/4] Reloading systemd and restarting services..."
sudo systemctl daemon-reload
sudo systemctl enable $APP_NAME-api
sudo systemctl enable $APP_NAME-web
sudo systemctl restart $APP_NAME-api
sudo systemctl restart $APP_NAME-web

echo -e "\n--- Deployment & Autostart Setup Successful ---"
echo "API status:"
sudo systemctl status $APP_NAME-api --no-pager
echo ""
echo "Web status:"
sudo systemctl status $APP_NAME-web --no-pager

echo -e "\nBackend Port: $API_PORT"
echo "Frontend Port: $WEB_PORT"
echo "Logs: tail -f $BACKEND_DIR/server.log"
echo "Logs: tail -f $FRONTEND_DIR/server.log"
echo "To manage: sudo systemctl [start|stop|restart] $APP_NAME-api|$APP_NAME-web"
