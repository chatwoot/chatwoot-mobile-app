#!/bin/bash

# Fix Firebase notification color conflict in AndroidManifest.xml
# This script works in both local dev and EAS build environments

set -e  # Exit on any error

echo "🔧 Starting Android manifest fix script..."
echo "🔍 Current working directory: $(pwd)"
echo "🔍 Environment variables: EAS_BUILD=${EAS_BUILD}, ENVIRONMENT=${ENVIRONMENT}"

MANIFEST_FILE="./android/app/src/main/AndroidManifest.xml"

# Check if we're running in EAS build environment or if file doesn't exist
if [ ! -f "$MANIFEST_FILE" ]; then
  echo "🔍 Manifest not found at $MANIFEST_FILE, searching..."
  
  # Search for AndroidManifest.xml files
  echo "🔍 All AndroidManifest.xml files found:"
  find . -name "AndroidManifest.xml" 2>/dev/null || echo "No AndroidManifest.xml files found"
  
  # Look for the main app manifest
  MANIFEST_FILE=$(find . -name "AndroidManifest.xml" -path "*/app/src/main/*" 2>/dev/null | head -1)
  
  if [ -z "$MANIFEST_FILE" ]; then
    echo "⚠️  Could not find main app AndroidManifest.xml"
    echo "🔍 Directory structure:"
    find . -type d -name android 2>/dev/null | head -5
    exit 1
  fi
fi

if [ -f "$MANIFEST_FILE" ]; then
  echo "📄 Found AndroidManifest.xml at: $MANIFEST_FILE"
  
  # Make a backup
  cp "$MANIFEST_FILE" "${MANIFEST_FILE}.backup"
  echo "💾 Created backup: ${MANIFEST_FILE}.backup"
  
  # Show current manifest content around Firebase notification color
  echo "🔍 Current Firebase notification color entries:"
  grep -n "com.google.firebase.messaging.default_notification_color" "$MANIFEST_FILE" || echo "None found"
  
  # Add xmlns:tools declaration if not present
  if ! grep -q 'xmlns:tools=' "$MANIFEST_FILE"; then
    echo "📝 Adding xmlns:tools declaration..."
    # Use sed without -i flag for better cross-platform compatibility
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS
      sed -i '' 's/<manifest xmlns:android="http:\/\/schemas.android.com\/apk\/res\/android"/<manifest xmlns:android="http:\/\/schemas.android.com\/apk\/res\/android" xmlns:tools="http:\/\/schemas.android.com\/tools"/g' "$MANIFEST_FILE"
      # Also handle cases where there might be other attributes
      sed -i '' 's/<manifest xmlns:android="http:\/\/schemas.android.com\/apk\/res\/android" \([^>]*\)>/<manifest xmlns:android="http:\/\/schemas.android.com\/apk\/res\/android" xmlns:tools="http:\/\/schemas.android.com\/tools" \1>/g' "$MANIFEST_FILE"
    else
      # Linux (EAS build environment)
      sed -i 's/<manifest xmlns:android="http:\/\/schemas.android.com\/apk\/res\/android"/<manifest xmlns:android="http:\/\/schemas.android.com\/apk\/res\/android" xmlns:tools="http:\/\/schemas.android.com\/tools"/g' "$MANIFEST_FILE"
      # Also handle cases where there might be other attributes
      sed -i 's/<manifest xmlns:android="http:\/\/schemas.android.com\/apk\/res\/android" \([^>]*\)>/<manifest xmlns:android="http:\/\/schemas.android.com\/apk\/res\/android" xmlns:tools="http:\/\/schemas.android.com\/tools" \1>/g' "$MANIFEST_FILE"
    fi
    echo "✅ Added xmlns:tools declaration to AndroidManifest.xml"
  else
    echo "ℹ️  xmlns:tools declaration already exists"
  fi
  
  # Check if tools:replace is already present to avoid duplicates
  if ! grep -q 'android:name="com.google.firebase.messaging.default_notification_color".*tools:replace="android:resource"' "$MANIFEST_FILE"; then
    echo "🔧 Adding tools:replace to Firebase notification color meta-data..."
    
    # First, let's see what we're working with
    echo "🔍 Lines containing notification color before fix:"
    grep -n "com.google.firebase.messaging.default_notification_color" "$MANIFEST_FILE" || echo "None found"
    
    # Use different sed syntax for macOS vs Linux
    # We'll use a more comprehensive approach to catch all variations
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS - Handle multiple patterns
      # Pattern 1: Simple attribute format
      sed -i '' 's/android:name="com.google.firebase.messaging.default_notification_color" android:resource="@color\/notification_icon_color"/android:name="com.google.firebase.messaging.default_notification_color" android:resource="@color\/notification_icon_color" tools:replace="android:resource"/g' "$MANIFEST_FILE"
      # Pattern 2: Meta-data tag with various spacing/formatting
      sed -i '' 's/<meta-data\([^>]*\)android:name="com.google.firebase.messaging.default_notification_color"\([^>]*\)android:resource="@color\/notification_icon_color"\([^>]*\)>/<meta-data\1android:name="com.google.firebase.messaging.default_notification_color"\2android:resource="@color\/notification_icon_color" tools:replace="android:resource"\3>/g' "$MANIFEST_FILE"
      # Pattern 3: Self-closing tag
      sed -i '' 's/<meta-data\([^>]*\)android:name="com.google.firebase.messaging.default_notification_color"\([^>]*\)android:resource="@color\/notification_icon_color"\([^>]*\)\/>/<meta-data\1android:name="com.google.firebase.messaging.default_notification_color"\2android:resource="@color\/notification_icon_color" tools:replace="android:resource"\3\/>/g' "$MANIFEST_FILE"
    else
      # Linux (EAS build environment) - Handle multiple patterns
      # Pattern 1: Simple attribute format
      sed -i 's/android:name="com.google.firebase.messaging.default_notification_color" android:resource="@color\/notification_icon_color"/android:name="com.google.firebase.messaging.default_notification_color" android:resource="@color\/notification_icon_color" tools:replace="android:resource"/g' "$MANIFEST_FILE"
      # Pattern 2: Meta-data tag with various spacing/formatting
      sed -i 's/<meta-data\([^>]*\)android:name="com.google.firebase.messaging.default_notification_color"\([^>]*\)android:resource="@color\/notification_icon_color"\([^>]*\)>/<meta-data\1android:name="com.google.firebase.messaging.default_notification_color"\2android:resource="@color\/notification_icon_color" tools:replace="android:resource"\3>/g' "$MANIFEST_FILE"
      # Pattern 3: Self-closing tag
      sed -i 's/<meta-data\([^>]*\)android:name="com.google.firebase.messaging.default_notification_color"\([^>]*\)android:resource="@color\/notification_icon_color"\([^>]*\)\/>/<meta-data\1android:name="com.google.firebase.messaging.default_notification_color"\2android:resource="@color\/notification_icon_color" tools:replace="android:resource"\3\/>/g' "$MANIFEST_FILE"
    fi
    
    echo "🔍 Lines containing notification color after fix attempt:"
    grep -n "com.google.firebase.messaging.default_notification_color" "$MANIFEST_FILE" || echo "None found"
    
    # Verify the fix was applied
    if grep -q 'android:name="com.google.firebase.messaging.default_notification_color".*tools:replace="android:resource"' "$MANIFEST_FILE"; then
      echo "✅ Successfully fixed Firebase notification color conflict in AndroidManifest.xml"
    else
      echo "⚠️  Failed to apply tools:replace fix. Manual intervention may be required."
      echo "📄 Please check the manifest file structure:"
      grep -n "com.google.firebase.messaging.default_notification_color" "$MANIFEST_FILE" || true
      exit 1
    fi
  else
    echo "✅ Firebase notification color conflict already fixed in AndroidManifest.xml"
  fi
  
  echo "🎉 Android manifest fix script completed successfully!"
else
  echo "❌ AndroidManifest.xml not found at $MANIFEST_FILE"
  echo "🔍 Current working directory: $(pwd)"
  echo "🔍 Available files:"
  find . -name "AndroidManifest.xml" 2>/dev/null | head -5 || echo "No AndroidManifest.xml files found"
  exit 1
fi