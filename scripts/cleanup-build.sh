#!/bin/bash

# Script to clean up after build

PROJECT_DIR="$(pwd)"

# Unstage and remove config files
git reset GoogleService-Info.plist google-services.json
rm -f "$PROJECT_DIR/GoogleService-Info.plist" "$PROJECT_DIR/google-services.json"
# Also remove from android/app directory
rm -f "$PROJECT_DIR/android/app/google-services.json"

# Restore original .gitignore
if [ -f "$PROJECT_DIR/.gitignore.bak" ]; then
  mv "$PROJECT_DIR/.gitignore.bak" "$PROJECT_DIR/.gitignore"
  echo "Restored original .gitignore"
else
  echo "Warning: No .gitignore backup found"
fi

echo "Cleanup complete"