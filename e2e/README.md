# Chatwoot Mobile App E2E Testing

This directory contains end-to-end testing for the Chatwoot mobile app using Appium.

## Setup

1. Install the required dependencies:
   ```bash
   pnpm install
   ```

2. Install Appium globally (optional, can use npx instead):
   ```bash
   npm install -g appium
   ```

3. Install Appium drivers for iOS and Android:
   ```bash
   appium driver install xcuitest
   appium driver install uiautomator2
   ```

4. Set up environment variables for testing. Copy the example .env file and modify it:
   ```bash
   cp e2e/.env.example e2e/.env
   ```
   
   Then edit the file to add your test credentials:
   ```
   TEST_USER_EMAIL=your_test_user@example.com
   TEST_USER_PASSWORD=your_password
   EXPO_PUBLIC_CHATWOOT_BASE_URL=https://your-chatwoot-instance.com
   ```

## Checking the Environment

Before running tests, it's recommended to check your environment to ensure everything is set up correctly:

```bash
pnpm check:environment
```

This will:
- Check Appium installation
- Run Appium doctor to identify any issues
- Detect available iOS simulators
- Check for Chatwoot app on simulators
- Check for connected Android devices

The script will create a file called `simulators.json` with information about available simulators. This file is used by the tests to automatically detect and use the correct simulator.

## Starting Appium Server

Start the Appium server in a separate terminal:

```bash
pnpm appium
```

This will start the Appium server on port 4723 with the base path `/wd/hub`.

## Running Tests

### iOS Testing

To run the iOS test:

```bash
pnpm test:e2e:ios
```

The iOS test will:
1. Connect to an iOS simulator using the iOS version detected
2. Open Safari and navigate to the Chatwoot URL
3. Attempt to log in using the credentials from your .env file
4. Take screenshots during the process for debug purposes

### Android Testing

To run the Android test:

```bash
pnpm test:e2e:android
```

The Android test will:
1. Connect to an Android emulator
2. Perform similar actions to the iOS test

## Troubleshooting

If tests fail, check the following:

1. Appium server is running
2. iOS simulator or Android emulator is available
3. Correct app is installed (or Safari/Chrome is being used)
4. Environment variables are set correctly
5. Check the screenshots in e2e/screenshots directory for visual debugging

For more detailed diagnostics, run:

```bash
npx appium driver doctor xcuitest
```

or 

```bash
npx appium driver doctor uiautomator2
```

## App vs Web Testing

The tests are initially configured to test with Safari (iOS) or Chrome (Android) to ensure that the basic setup is working. Once confirmed, you can enable app testing by uncommenting the app-specific configuration in the test files.

## Adding More Tests

To add more tests:
1. Create new test files in e2e/ios/specs or e2e/android/specs
2. Follow the same structure as the existing login tests
3. Use the BatchTool pattern for improved organization