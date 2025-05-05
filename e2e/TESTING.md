# Chatwoot Mobile App E2E Testing Guide

This document outlines how to set up and run end-to-end tests for the Chatwoot mobile app using Appium.

## Prerequisites

1. Ensure you have Node.js and pnpm installed
2. Install required dependencies:
   ```bash
   pnpm install
   ```
3. Install Appium CLI globally:
   ```bash
   npm install -g appium
   ```
4. Install Appium drivers:
   ```bash
   appium driver install xcuitest
   appium driver install uiautomator2
   ```

## Configuration

1. Create an environment file for test credentials:
   ```bash
   cp e2e/.env.example e2e/.env
   ```

2. Edit `e2e/.env` to add your test user credentials:
   ```
   TEST_USER_EMAIL=your_test_user@example.com
   TEST_USER_PASSWORD=your_test_password
   EXPO_PUBLIC_CHATWOOT_BASE_URL=https://your-chatwoot-instance.com
   ```

## Running Tests

### Step 1: Build the app
Run one of the following commands to build the app for testing:

```bash
# For iOS
pnpm build:ios:local

# For Android
pnpm build:android:local
```

### Step 2: Start the Appium server
Open a terminal window and run:

```bash
pnpm appium
```

### Step 3: Run the tests
In a separate terminal window, run:

```bash
# For iOS
pnpm test:e2e:ios

# For Android
pnpm test:e2e:android
```

## Test Structure

- `e2e/ios/specs/login.test.js` - iOS login test
- `e2e/android/specs/login.test.js` - Android login test
- `e2e/utils/helpers.js` - Helper functions for tests
- `e2e/start-appium.js` - Script to start Appium server
- `e2e/config/` - Configuration files for WebdriverIO

## Troubleshooting

### No simulators/emulators found
Make sure you have an iOS simulator or Android emulator running before starting the tests.

For iOS, open Xcode and start a simulator.
For Android, open Android Studio and start an emulator.

### App not found
If you get an error that the app could not be found, verify that:
1. You've built the app using the build commands
2. The bundle ID in the test matches your app's bundle ID

### Connection issues
If the test can't connect to the Appium server:
1. Make sure the Appium server is running on port 4723
2. Check for any firewalls blocking connections
3. Try restarting the Appium server

### Authentication issues
If login fails:
1. Check the credentials in your e2e/.env file
2. Verify the user exists and has the correct permissions
3. Check that the Chatwoot base URL is correct

## Adding More Tests

To add more test scenarios:
1. Create a new test file in the appropriate directory (ios/specs or android/specs)
2. Use the WebdriverIO API to interact with the app
3. Add helper functions to e2e/utils/helpers.js if needed