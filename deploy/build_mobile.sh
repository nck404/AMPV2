#!/bin/bash

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MOBILE_DIR="$PROJECT_DIR/source/frontend/mobile"

echo "=============================================="
echo "BAT DAU DON DEP VA BUILD MOBILE APP"
echo "=============================================="

echo "[1/4] Chuyen den thu muc mobile app..."
cd "$MOBILE_DIR"

echo "[2/4] Dang don dep du an..."
rm -rf node_modules build .svelte-kit package-lock.json
echo "Da xoa cac thu muc va file tam thanh cong."

echo "[3/4] Dang cai dat lai cac thu vien (npm install)..."
npm install

echo "[4/4] Dang build du an..."
npm run build

echo "=============================================="
echo "HOAN TAT! DU AN DA DUOC DON DEP VA BUILD."
echo "Thu muc chua code da build: $MOBILE_DIR/build"
echo "=============================================="
