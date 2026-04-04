#!/bin/bash

# ==============================================================================
# AMP Development System Startup Script for Linux/macOS
# Usage: ./start_dev.sh
# Note: You may need to make this script executable first: chmod +x start_dev.sh
# ==============================================================================

# ANSI color codes for terminal output
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
echo -e "  ${GREEN}Starting AMP Development System${NC}"
echo "=========================================="
echo ""

# Find the absolute path to the project root (2 levels up from Src/tools/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Function to handle cleanup when the script is stopped (Ctrl+C)
cleanup() {
    echo -e "\n${YELLOW}[System]${NC} Shutting down AMP System..."
    # Kill all background processes started by this script
    pkill -P $$
    exit 0
}

# Trap SIGINT (Ctrl+C) and SIGTERM to run the cleanup function
trap cleanup SIGINT SIGTERM

# ---------------------------------------------------------
# [1/2] Start Backend
# ---------------------------------------------------------
echo -e "${CYAN}[1/2]${NC} Initializing Backend (Flask)..."

# Support both lowercase and uppercase directory names (Windows vs Linux compatibility)
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

# Check if python3 is available, else fallback to python
if command -v python3 &>/dev/null; then
    python3 app.py &
else
    python app.py &
fi
BACKEND_PID=$!

# Wait a moment for the backend to initialize
sleep 2

# ---------------------------------------------------------
# [2/2] Start Frontend
# ---------------------------------------------------------
echo -e "\n${CYAN}[2/2]${NC} Launching Visual Interface (SvelteKit)..."

if [ -d "$PROJECT_ROOT/src/frontend/amp" ]; then
    FRONTEND_DIR="$PROJECT_ROOT/src/frontend/amp"
elif [ -d "$PROJECT_ROOT/Src/Frontend/amp" ]; then
    FRONTEND_DIR="$PROJECT_ROOT/Src/Frontend/amp"
else
    echo -e "${RED}Error: Frontend directory not found.${NC}"
    cleanup
fi

cd "$FRONTEND_DIR" || cleanup

if command -v pnpm &>/dev/null; then
    pnpm run dev &
elif command -v npm &>/dev/null; then
    npm run dev &
else
    echo -e "${RED}Error: pnpm or npm not found. Please install Node.js and a package manager.${NC}"
    cleanup
fi
FRONTEND_PID=$!

echo ""
echo "=========================================="
echo -e "  ${GREEN}System Active. Access local portals.${NC}"
echo -e "  ${YELLOW}Press Ctrl+C to stop all services.${NC}"
echo "=========================================="

# Keep the script running and wait for background processes
wait $BACKEND_PID $FRONTEND_PID
