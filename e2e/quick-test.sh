#!/bin/bash
# Quick E2E Test Runner for Chatwoot Mobile App
# This script runs a web-only test with Safari, avoiding emulator dependencies

# Exit on error
set -e

# Check if Appium is installed
if ! command -v appium &> /dev/null; then
  echo "Appium not found. Please install it with 'npm install -g appium'"
  exit 1
fi

# Start Appium server in background
echo "Starting Appium server..."
appium --address 127.0.0.1 --port 4723 --log-level info --base-path /wd/hub > appium.log 2>&1 &
APPIUM_PID=$!

# Wait minimal time for Appium to start
echo "Waiting for Appium to start..."
sleep 2

# Create a function to clean up processes on exit
cleanup() {
  echo "Cleaning up..."
  if [ -n "$APPIUM_PID" ]; then
    echo "Stopping Appium server (PID: $APPIUM_PID)"
    kill $APPIUM_PID 2>/dev/null || true
  fi
  echo "Done cleaning up"
}

# Set up trap to call cleanup function on exit
trap cleanup EXIT INT TERM

# Create a temporary file to modify for Safari-only testing
TMP_FILE=$(mktemp)
cat > $TMP_FILE << 'EOF'
// Force Safari browser testing for quick runs
const forceWebMode = true;

// Override config
const originalGetTestConfig = require('../../detect-ci').getTestConfig;
require.cache[require.resolve('../../detect-ci')].exports.getTestConfig = () => {
  const config = originalGetTestConfig();
  config.useWebApp = true;
  return config;
};

// Continue with normal imports
require('./login.test.js');
EOF

# Run tests
echo "Running quick Safari tests..."
NODE_OPTIONS="--experimental-vm-modules" node $TMP_FILE || {
  echo "Test failed with status: $?"
  exit 1
}

echo "Tests completed"
exit 0 