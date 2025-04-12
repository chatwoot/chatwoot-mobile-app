# CircleCI Configuration for Chatwoot Mobile App

This document explains how to set up and configure CircleCI for running both unit tests and end-to-end tests for the Chatwoot mobile app.

## Configuration Overview

The CircleCI configuration is defined in `.circleci/config.yml` and consists of two main jobs:

1. `build-and-test`: Runs unit tests and linting
2. `e2e-tests`: Runs end-to-end tests using Appium

## Setting Up End-to-End Testing

The end-to-end tests require certain environment variables to be set up in a CircleCI context called `chatwoot-e2e-tests`.

### Required Environment Variables

Add the following variables to the `chatwoot-e2e-tests` context in CircleCI:

- `TEST_USER_EMAIL`: Email address for a test user account
- `TEST_USER_PASSWORD`: Password for the test user account
- `EXPO_PUBLIC_CHATWOOT_BASE_URL`: URL of the Chatwoot instance to test against
- `PLATFORM` (optional): Set to `ios` or `android` to run tests for a specific platform only

### Setting Up CircleCI Context

1. Go to the CircleCI dashboard for your project
2. Navigate to Project Settings > Contexts
3. Create a new context called `chatwoot-e2e-tests`
4. Add the environment variables listed above

## Testing Limitations

Note that the current CircleCI configuration runs E2E tests in a simulated environment:

- The tests might not have access to real device capabilities
- Some tests that require specific hardware capabilities might be skipped
- For complete testing, consider using a service like BrowserStack or AWS Device Farm for real device testing

## Troubleshooting

If you encounter issues with the E2E tests in CircleCI:

1. Check the logs for any errors in the Appium server startup
2. Verify that all required environment variables are correctly set in the CircleCI context
3. Examine the screenshots that are saved as artifacts from failed test runs
4. If necessary, modify the test scripts to accommodate the CircleCI environment

## Converting to PNPM

This configuration currently uses Yarn, but plans to migrate to PNPM. When ready, update:

1. The cache keys and paths in the config.yml file
2. The installation commands to use pnpm
3. The test run commands to use pnpm