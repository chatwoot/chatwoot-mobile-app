#!/bin/bash

# EAS Build Post-Install Script
# This script runs after npm install and after expo prebuild

set -e  # Exit on any error

echo "🚀 Running EAS post-install tasks..."
echo "🔍 Build platform: ${EAS_BUILD_PLATFORM}"

echo "✅ EAS post-install tasks completed!"

