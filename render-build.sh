#!/usr/bin/env bash
# exit on error
set -o errexit

# Build the frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Install backend dependencies
echo "Installing backend dependencies..."
npm install

# Install Chrome for Puppeteer (specific for Render)
if [[ ! -d $PUPPETEER_CACHE_DIR ]]; then
  echo "Installing Chrome..."
  npx puppeteer browsers install chrome
fi
