#!/bin/bash

# EAS Build Post-Install Script
# This script runs after npm install and after expo prebuild

set -e  # Exit on any error

echo "🚀 Running EAS post-install tasks..."
echo "🔍 Build platform: ${EAS_BUILD_PLATFORM}"

# Fix Android manifest Firebase notification color conflict (Android only)
if [ "$EAS_BUILD_PLATFORM" = "android" ]; then
  echo "🔧 Step 1: Fixing Android manifest..."
  bash scripts/fix-android-manifest.sh
else
  echo "⏭️  Skipping Android manifest fix (not an Android build)"
fi

echo "✅ EAS post-install tasks completed!"

