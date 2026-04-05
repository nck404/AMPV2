#!/bin/bash

# ==============================================================================
# AMP VPS Host Startup Script
# Usage: ./start-host.sh
# Description: Starts the backend and frontend in the background (nohup),
# allowing you to safely close your SSH/Terminal session without stopping the app.
# Both services are bound to 0.0.0.0 to allow external Internet access.
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
echo -e "  ${GREEN}Starting AMP for VPS Hosting${NC}"
echo "=========================================="
echo ""

# Find the absolute path to the project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# ---------------------------------------------------------
# [1/2] Start Backend (Flask)
# ---------------------------------------------------------
echo -e "${CYAN}[1/2]${NC} Initializing Backend on 0.0.0.0:6333..."

# Handle directory casing
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

# Kill any existing processes running on port 6333 to prevent "address already in use"
fuser -k 6333/tcp 2>/dev/null
sleep 1

# Start Backend in background using nohup
if command -v python3 &>/dev/null; then
    nohup python3 app.py > backend_host.log 2>&1 &
else
    nohup python app.py > backend_host.log 2>&1 &
fi
BACKEND_PID=$!
echo -e "  -> ${GREEN}Backend running in background (PID: $BACKEND_PID)${NC}"

# ---------------------------------------------------------
# [2/2] Start Frontend (SvelteKit/Vite)
# ---------------------------------------------------------
echo -e "\n${CYAN}[2/2]${NC} Building and Launching Frontend on 0.0.0.0:5173..."

if [ -d "$PROJECT_ROOT/src/frontend/amp" ]; then
    FRONTEND_DIR="$PROJECT_ROOT/src/frontend/amp"
elif [ -d "$PROJECT_ROOT/Src/Frontend/amp" ]; then
    FRONTEND_DIR="$PROJECT_ROOT/Src/Frontend/amp"
else
    echo -e "${RED}Error: Frontend directory not found.${NC}"
    exit 1
fi

cd "$FRONTEND_DIR" || exit 1

# Kill any existing Vite processes on port 5173
fuser -k 5173/tcp 2>/dev/null
sleep 1

# Start Frontend in background using nohup and bind to 0.0.0.0 via --host
if command -v pnpm &>/dev/null; then
    echo -e "  -> ${YELLOW}Building frontend for production...${NC}"
    pnpm run build
    nohup pnpm run preview -- --host 0.0.0.0 --port 5173 > frontend_host.log 2>&1 &
elif command -v npm &>/dev/null; then
    echo -e "  -> ${YELLOW}Building frontend for production...${NC}"
    npm run build
    nohup npm run preview -- --host 0.0.0.0 --port 5173 > frontend_host.log 2>&1 &
else
    echo -e "${RED}Error: Package manager not found.${NC}"
    exit 1
fi
FRONTEND_PID=$!
echo -e "  -> ${GREEN}Frontend running in background (PID: $FRONTEND_PID)${NC}"

echo ""
echo "======================================================================"
echo -e "  ${GREEN}AMP System is now LIVE on your VPS!${NC}"
echo -e "  You can safely close this terminal/SSH session."
echo ""
echo -e "  ${YELLOW}Logs (to monitor errors):${NC}"
echo -e "  - Backend:  tail -f $BACKEND_DIR/backend_host.log"
echo -e "  - Frontend: tail -f $FRONTEND_DIR/frontend_host.log"
echo ""
echo -e "  ${RED}To stop the system later, run:${NC}"
echo -e "  kill $BACKEND_PID $FRONTEND_PID"
echo "======================================================================"
