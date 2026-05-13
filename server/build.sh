#!/bin/bash
set -e

echo "======================================"
echo "  SafeGuard Full-Stack Build"
echo "======================================"

# Render sets rootDir to server/, so we are inside server/ when this runs
# The repo root is one level up: ../
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SERVER_DIR="$REPO_ROOT/server"
CLIENT_DIR="$REPO_ROOT/client"

echo "Repo root:   $REPO_ROOT"
echo "Server dir:  $SERVER_DIR"
echo "Client dir:  $CLIENT_DIR"

# ── Step 1: Install server dependencies ──────────────────────
echo ""
echo "=== [1/3] Installing server dependencies ==="
cd "$SERVER_DIR"
npm install
echo "Server deps: $(ls node_modules | wc -l) packages"

# ── Step 2: Install client dependencies ──────────────────────
echo ""
echo "=== [2/3] Installing client dependencies ==="
cd "$CLIENT_DIR"
# NODE_ENV=development ensures devDependencies (react-scripts) are installed
NODE_ENV=development npm install
echo "Client deps: $(ls node_modules | wc -l) packages"

# ── Step 3: Build React app ───────────────────────────────────
echo ""
echo "=== [3/3] Building React app ==="
REACT_APP_API_URL=https://safeguard-api-5cii.onrender.com/api \
REACT_APP_SOCKET_URL=https://safeguard-api-5cii.onrender.com \
NODE_ENV=production \
npm run build

echo ""
echo "=== Build output ==="
ls -la "$CLIENT_DIR/build/"

echo ""
echo "======================================"
echo "  Build complete ✅"
echo "======================================"
