#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/harmoniq"
echo "Stopping any existing Next.js dev servers..."
pkill -f "next dev" 2>/dev/null || true
echo "Installing dependencies..."
npm install
echo "Starting HarmoniQ at http://localhost:3000"
exec npm run dev
