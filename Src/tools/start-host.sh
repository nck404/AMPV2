#!/bin/bash

# ==============================================================================
# AMP VPS Host Startup Script (PM2 Version)
# Usage: ./start-host.sh
# Description: Starts the backend and frontend using PM2,
# providing process monitoring and automatic restarts.
# ==============================================================================

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo ",--,--.,--,--,--. ,---.  "
echo "' ,-.  ||        || .-. | "
echo "\ '-'  ||  |  |  || '-' ' "
echo " \`--\`--'\`--\`--\`--'|  |-'  "
echo "                  \`--'    "
echo -e "${NC}"
echo "=========================================="
echo -e "  ${GREEN}Starting AMP with PM2${NC}"
echo "=========================================="
echo ""

# Find the absolute path to the project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Check if PM2 is installed
if ! command -v pm2 &>/dev/null; then
    echo -e "${RED}Error: PM2 is not installed. Please install it with 'npm install -g pm2'${NC}"
    exit 1
fi

# ---------------------------------------------------------
# [1/2] Prepare Backend (Flask)
# ---------------------------------------------------------
echo -e "${CYAN}[1/2]${NC} Preparing Backend..."

if [ -d "$PROJECT_ROOT/src/backend" ]; then
    BACKEND_DIR="$PROJECT_ROOT/src/backend"
elif [ -d "$PROJECT_ROOT/Src/backend" ]; then
    BACKEND_DIR="$PROJECT_ROOT/Src/backend"
elif [ -d "$PROJECT_ROOT/Src/Backend" ]; then
    BACKEND_DIR="$PROJECT_ROOT/Src/Backend"
else
    echo -e "${RED}Error: Backend directory not found.${NC}"
    exit 1
fi

cd "$BACKEND_DIR" || exit 1

# Apply Database Migrations
echo -e "  -> ${YELLOW}Migrating database schema...${NC}"
export FLASK_APP=app.py
if command -v flask &>/dev/null; then
    flask db upgrade
elif command -v python3 &>/dev/null; then
    python3 -m flask db upgrade
else
    python -m flask db upgrade
fi

# ---------------------------------------------------------
# [2/2] Prepare Frontend (SvelteKit)
# ---------------------------------------------------------
echo -e "\n${CYAN}[2/2]${NC} Building Frontend..."

if [ -d "$PROJECT_ROOT/src/frontend/amp" ]; then
    FRONTEND_DIR="$PROJECT_ROOT/src/frontend/amp"
elif [ -d "$PROJECT_ROOT/Src/Frontend/amp" ]; then
    FRONTEND_DIR="$PROJECT_ROOT/Src/Frontend/amp"
else
    echo -e "${RED}Error: Frontend directory not found.${NC}"
    exit 1
fi

cd "$FRONTEND_DIR" || exit 1

# Build frontend
echo -e "  -> ${YELLOW}Compiling production bundle...${NC}"
if command -v pnpm &>/dev/null; then
    pnpm run build
elif command -v npm &>/dev/null; then
    npm run build
fi

# ---------------------------------------------------------
# Start Services with PM2
# ---------------------------------------------------------
echo -e "\n${CYAN}[FINAL]${NC} Launching services with PM2..."

cd "$PROJECT_ROOT" || exit 1

# Restart or Start the services using ecosystem file
pm2 start ecosystem.config.js

echo ""
echo "======================================================================"
echo -e "  ${GREEN}AMP System is now LIVE and managed by PM2!${NC}"
echo ""
echo -e "  ${YELLOW}Useful PM2 commands:${NC}"
echo -e "  - View status:  pm2 list"
echo -e "  - View logs:    pm2 logs"
echo -e "  - Stop all:     pm2 stop all"
echo -e "  - Restart all:  pm2 restart all"
echo "======================================================================"
