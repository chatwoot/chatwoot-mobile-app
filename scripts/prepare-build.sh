#!/bin/bash

# Script to prepare iOS/Android build by copying required config files

CONFIG_DIR="$HOME/Documents/chatwoot-config-files"
PROJECT_DIR="$(pwd)"

# Check if config directory exists
if [ ! -d "$CONFIG_DIR" ]; then
  echo "Error: Config directory not found at $CONFIG_DIR"
  echo "Please create this directory and place your config files there."
  exit 1
fi

# Create a temporary .gitignore backup
if [ -f "$PROJECT_DIR/.gitignore" ]; then
  cp "$PROJECT_DIR/.gitignore" "$PROJECT_DIR/.gitignore.bak"
  echo "Made backup of .gitignore"
fi

# Modify .gitignore to temporarily allow config files
if [ -f "$PROJECT_DIR/.gitignore" ]; then
  # Remove lines that ignore our config files
  sed -i '' '/googleservice-info.plist/d' "$PROJECT_DIR/.gitignore"
  sed -i '' '/google-services.json/d' "$PROJECT_DIR/.gitignore"
  echo "Modified .gitignore to allow config files"
fi

# Copy iOS config files
if [ -f "$CONFIG_DIR/GoogleService-Info.plist" ]; then
  echo "Copying GoogleService-Info.plist for iOS..."
  cp "$CONFIG_DIR/GoogleService-Info.plist" "$PROJECT_DIR/GoogleService-Info.plist"
else
  echo "Warning: GoogleService-Info.plist not found in $CONFIG_DIR"
fi

# Copy Android config files
if [ -f "$CONFIG_DIR/google-services.json" ]; then
  echo "Copying google-services.json for Android..."
  cp "$CONFIG_DIR/google-services.json" "$PROJECT_DIR/google-services.json"
else
  echo "Warning: google-services.json not found in $CONFIG_DIR"
fi

# Add the files to git staging (but don't commit)
git add GoogleService-Info.plist google-services.json

echo "Config files added to git staging for the build"
echo "Build preparation complete!"