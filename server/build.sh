#!/bin/bash
set -e

echo "=== Installing server dependencies ==="
npm install

echo "=== Installing client dependencies (including devDependencies) ==="
cd "$(dirname "$0")/../client"

# Must set NODE_ENV=development so react-scripts (devDependency) gets installed
NODE_ENV=development npm install

echo "=== Building React app ==="
# Force production API URLs regardless of .env files
REACT_APP_API_URL=https://safeguard-api-5cii.onrender.com/api \
REACT_APP_SOCKET_URL=https://safeguard-api-5cii.onrender.com \
NODE_ENV=production npm run build

echo "=== Build complete ==="
ls -la build/
