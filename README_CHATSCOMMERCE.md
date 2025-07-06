# Chatwoot Mobile App - Initial Setup Guide

This guide will help you set up and run the Chatwoot mobile application on both Android and iOS platforms.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

1. **Node.js** (version 18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **pnpm** (Package Manager)
   - Install globally: `npm install -g pnpm`
   - Verify installation: `pnpm --version`

3. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

4. **Expo CLI**
   - Install globally: `npm install -g @expo/cli`
   - Verify installation: `expo --version`

### Platform-Specific Requirements

#### For Android Development

1. **Android Studio**
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Install Android SDK (API level 34 recommended)
   - Set up Android Virtual Device (AVD) or connect a physical device

2. **Java Development Kit (JDK)**
   - Android Studio usually includes this
   - Verify: `java --version`

#### For iOS Development (macOS only)

1. **Xcode** (latest version)
   - Download from Mac App Store
   - Install Xcode Command Line Tools: `xcode-select --install`

2. **iOS Simulator**
   - Included with Xcode
   - Or use a physical iOS device

## Project Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd chatwoot-mobile-app
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables from the .env.example file.



### 4. Firebase Setup (Required for Push Notifications)

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one

2. **Android Configuration**
   - Add an Android app to your Firebase project
   - Package name: `com.chatwoot.app`
   - Download `google-services.json` and place it in the project root

3. **iOS Configuration**
   - Add an iOS app to your Firebase project
   - Bundle ID: `com.chatwoot.app`
   - Download `GoogleService-Info.plist` and place it in the project root

### 5. Expo Development Build

Generate the native development build:

```bash
# Clean prebuild (recommended for first setup)
pnpm run generate

# Or soft prebuild (if you've done this before)
pnpm run generate:soft
```

## Running the Application

### Development Mode

Start the Expo development server:

```bash
pnpm start
```

This will open the Expo development tools in your browser where you can:
- Scan QR code with Expo Go app (for managed workflow)
- Press `a` to run on Android
- Press `i` to run on iOS

### Platform-Specific Commands

#### Android

```bash
# Run on Android device/emulator
pnpm run android

# Or use the direct command
pnpm run run:android
```

#### iOS (macOS only)

```bash
# Run on iOS simulator/device
pnpm run ios

# Or use the direct command
pnpm run run:ios
```

## Metro Bundler and Logging

### Understanding Metro

**Metro is the JavaScript bundler** that compiles and serves your React Native code. You don't need to run Metro manually - it's automatically handled by the Expo and React Native tooling.

### Running Metro and Viewing Logs

#### Method 1: All-in-One Commands (Recommended)

```bash
# This starts Metro AND runs the Android app
pnpm run android

# This starts Metro with Expo dev tools
pnpm start
# Then press 'a' to run on Android, or scan QR code
```

#### Method 2: Separate Commands (More Control)

```bash
# Terminal 1: Start Metro first (to see logs clearly)
pnpm start

# Terminal 2: Run Android app
pnpm run android
```

#### Method 3: Direct React Native Commands

```bash
# Terminal 1: Start Metro bundler directly
npx react-native start

# Terminal 2: Run Android app
npx react-native run-android
```

### Viewing Different Types of Logs

#### Metro Logs (JavaScript logs)
The terminal where you ran Metro will show:
- `console.log()` statements from your React Native code
- Bundling progress
- Hot reload notifications
- JavaScript errors and warnings

#### Android System Logs
```bash
# In a third terminal (optional, for native Android logs)
adb logcat

# OR filtered for your app
adb logcat | grep "com.chatwoot.app"
```

#### iOS Logs
```bash
# View iOS simulator logs
npx react-native log-ios
```

### Recommended Development Workflow

1. **Start Metro first** (to see logs clearly):
   ```bash
   pnpm start
   ```

2. **In another terminal, run Android**:
   ```bash
   pnpm run android
   ```

3. **Optional: Watch Android logs** (third terminal):
   ```bash
   adb logcat | grep "ReactNative\|com.chatwoot.app"
   ```

### When Metro Gets Stuck

Sometimes Metro gets cached or stuck, and you might need to:

```bash
# Clean Metro cache
pnpm run clean

# Or restart with cache cleared
pnpm start --clear
```

## Available Scripts

Here are the most commonly used scripts from `package.json`:

### Development Scripts
- `pnpm start` - Start Expo development server
- `pnpm run android` - Run on Android
- `pnpm run ios` - Run on iOS
- `pnpm run clean` - Clean cache and dependencies

### Build Scripts
- `pnpm run generate` - Generate native code (clean prebuild)
- `pnpm run generate:soft` - Generate native code (soft prebuild)
- `pnpm run build:android` - Build Android app for production
- `pnpm run build:ios` - Build iOS app for production

### Testing and Quality
- `pnpm test` - Run tests
- `pnpm run lint` - Run ESLint

### Storybook (Component Development)
- `pnpm run start:storybook` - Start Storybook server
- `pnpm run storybook:android` - Run Storybook on Android
- `pnpm run storybook:ios` - Run Storybook on iOS

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   pnpm run clean
   pnpm install
   ```

2. **Android build failures**
   - Ensure Android SDK is properly installed
   - Check that `ANDROID_HOME` environment variable is set
   - Verify Android Virtual Device is running

3. **iOS build failures**
   - Ensure Xcode is up to date
   - Run `cd ios && pod install` if using CocoaPods
   - Clear derived data in Xcode

### Environment Variables Issues

If you encounter issues with environment variables:

1. Ensure `.env` file is in the project root
2. Restart the development server after changing environment variables
3. For production builds, set environment variables in your CI/CD pipeline


## Development Environment

- **Node.js**: 18+
- **React Native**: 0.76.9
- **Expo SDK**: ~52.0.46
- **TypeScript**: 5.1.3
- **Minimum iOS Version**: 13.0
- **Minimum Android API Level**: 24
