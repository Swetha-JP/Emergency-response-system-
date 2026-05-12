#!/bin/bash
set -e

echo "=== Installing server dependencies ==="
npm install

echo "=== Installing client dependencies ==="
cd "$(dirname "$0")/../client"
npm install

echo "=== Building React app ==="
npm run build

echo "=== Build complete ==="
