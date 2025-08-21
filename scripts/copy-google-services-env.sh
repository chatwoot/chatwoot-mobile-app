#!/bin/bash

# Script to copy the correct Google Services files based on environment
# Usage: ./scripts/copy-google-services-env.sh <environment>
# Example: ./scripts/copy-google-services-env.sh development
# Example: ./scripts/copy-google-services-env.sh production

ENVIRONMENT=$1

if [ -z "$ENVIRONMENT" ]; then
    echo "❌ Error: Please specify environment (development or production)"
    echo "Usage: ./scripts/copy-google-services-env.sh <environment>"
    exit 1
fi

if [ "$ENVIRONMENT" != "development" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo "❌ Error: Environment must be 'development' or 'production'"
    exit 1
fi

echo "📱 Copying Google Services files for $ENVIRONMENT..."

# Determine source files based on environment
if [ "$ENVIRONMENT" = "development" ]; then
    ANDROID_SOURCE="./credentials/android/google-services-dev.json"
    IOS_SOURCE="./credentials/ios/GoogleService-Info-dev.plist"
else
    ANDROID_SOURCE="./credentials/android/google-services.json"
    IOS_SOURCE="./credentials/ios/GoogleService-Info.plist"
fi

# Copy Android Google Services file
if [ -f "$ANDROID_SOURCE" ]; then
    cp "$ANDROID_SOURCE" "./android/app/google-services.json"
    echo "✅ Android: Copied $ANDROID_SOURCE to ./android/app/google-services.json"
else
    echo "❌ Android: Source file $ANDROID_SOURCE not found"
    exit 1
fi

# Copy iOS Google Services file
if [ -f "$IOS_SOURCE" ]; then
    cp "$IOS_SOURCE" "./ios/GoogleService-Info.plist"
    echo "✅ iOS: Copied $IOS_SOURCE to ./ios/GoogleService-Info.plist"
else
    echo "❌ iOS: Source file $IOS_SOURCE not found"
    exit 1
fi

echo "✅ Google Services files updated successfully for $ENVIRONMENT!"