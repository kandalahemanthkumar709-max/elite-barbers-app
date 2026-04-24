#!/usr/bin/env bash
# exit on error
set -o errexit

# Build the frontend
echo "Building frontend..."
cd frontend
npm install
# Force Vite to see the environment variable during build
VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID npm run build
cd ..

# Install backend dependencies
echo "Installing backend dependencies..."
npm install
