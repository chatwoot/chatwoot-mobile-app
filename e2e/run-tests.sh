#!/bin/bash
# E2E Test Runner for Chatwoot Mobile App
# This script handles starting the Appium server, emulator, and running tests

# Exit on error
set -e

# Check if Appium is installed
if ! command -v appium &> /dev/null; then
  echo "Appium not found. Please install it with 'npm install -g appium'"
  exit 1
fi

# Start Appium server in background
echo "Starting Appium server..."
appium --address 127.0.0.1 --port 4723 --log-level info --log-timestamp --base-path /wd/hub > appium.log 2>&1 &
APPIUM_PID=$!

# Wait minimal time for Appium to start
echo "Waiting for Appium to start..."
sleep 2

# Create a function to clean up processes on exit
cleanup() {
  echo "Cleaning up..."
  # Kill Appium
  if [ -n "$APPIUM_PID" ]; then
    echo "Stopping Appium server (PID: $APPIUM_PID)"
    kill $APPIUM_PID 2>/dev/null || true
  fi
  
  # Kill any emulators
  if [ -n "$EMULATOR_PID" ]; then
    echo "Stopping emulator (PID: $EMULATOR_PID)"
    kill $EMULATOR_PID 2>/dev/null || true
  fi
  
  echo "Done cleaning up"
}

# Set up trap to call cleanup function on exit
trap cleanup EXIT INT TERM

# Run iOS tests
echo "Running iOS tests..."
NODE_OPTIONS="--experimental-vm-modules" node e2e/ios/specs/login.test.js || {
  echo "iOS test failed with status: $?"
  iOS_RESULT=1
}
iOS_RESULT=${iOS_RESULT:-$?}
echo "iOS tests completed with status: $iOS_RESULT"

# Start Android emulator if tests require it
echo "Starting Android emulator..."
emulator -avd Pixel_2_API_35 -no-window -no-audio -no-boot-anim > emulator.log 2>&1 &
EMULATOR_PID=$!

# Wait minimal time for emulator to start
echo "Waiting for Android emulator to boot..."
sleep 10

# Run Android tests
echo "Running Android tests..."
NODE_OPTIONS="--experimental-vm-modules" node e2e/android/specs/login.test.js || {
  echo "Android test failed with status: $?"
  ANDROID_RESULT=1
}
ANDROID_RESULT=${ANDROID_RESULT:-$?}
echo "Android tests completed with status: $ANDROID_RESULT"

# Return non-zero if any test failed
if [ $iOS_RESULT -ne 0 ] || [ $ANDROID_RESULT -ne 0 ]; then
  echo "Tests failed"
  exit 1
else
  echo "All tests passed"
  exit 0
fi 