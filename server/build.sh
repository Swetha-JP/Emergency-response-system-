#!/bin/bash
set -e

echo "=== Installing server dependencies ==="
npm install

echo "=== Installing client dependencies (including devDependencies) ==="
cd "$(dirname "$0")/../client"

# Must set NODE_ENV=development so react-scripts (devDependency) gets installed
NODE_ENV=development npm install

echo "=== Building React app ==="
NODE_ENV=production npm run build

echo "=== Build complete ==="
ls -la build/
