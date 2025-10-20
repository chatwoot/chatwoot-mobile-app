#!/bin/bash

# EAS Build Post-Install Script
# This script runs after npm install and after expo prebuild

set -e  # Exit on any error

echo "🚀 Running EAS post-install tasks..."

# Fix Android manifest Firebase notification color conflict
echo "🔧 Step 1: Fixing Android manifest..."
bash scripts/fix-android-manifest.sh

echo "✅ EAS post-install tasks completed!"

