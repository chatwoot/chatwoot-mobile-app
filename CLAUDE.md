# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Chatwoot Mobile App Developer Guide

## Development Workflow Tips

- Always test your changes after implementation with appropriate commands
- Never make changes without verifying they work as expected
- Test script changes by running them at least once
- When updating this CLAUDE.md file, also update the corresponding file in .cursor/rules/repo.mdc to keep them in sync
- When creating scripts that generate log files, ensure they are added to .gitignore
- Never commit temporary files, logs, or environment files to the repository

## Build/Lint/Test Commands

- `pnpm test` - Run all Jest tests
- `pnpm lint` - Run ESLint on the codebase
- `npx jest path/to/file.spec.ts` - Run a specific test file
- `npx jest -t "test name pattern"` - Run tests matching a pattern
- `pnpm start` - Start Expo development server
- `pnpm run:ios` - Run on iOS simulator
- `pnpm run:android` - Run on Android emulator
- `pnpm clean` - Clean project
- `pnpm reset` - Clean, reinstall deps, and regenerate native code
- `pnpm generate` - Clean and regenerate the native directories

## End-to-End Testing

- `pnpm e2e` - Run a quick environment check for e2e testing
- `pnpm e2e:run` - Run full e2e tests using run-tests.sh script
- `pnpm e2e:quick` - Run quick e2e test with Safari only
- `pnpm appium` - Start Appium server with correct configuration
- `pnpm test:e2e:ios` - Run iOS e2e test directly
- `pnpm test:e2e:android` - Run Android e2e test directly

Before running e2e tests:
1. Create `e2e/.env` with test credentials
2. Start the Appium server in a separate terminal with `pnpm appium`
3. For app testing, build the app with `pnpm build:ios:local` or `pnpm build:android:local`

## Troubleshooting Build Issues

- If you encounter encryption-related prompts during iOS builds, ensure `ITSAppUsesNonExemptEncryption: false` is set in app.config.ts
- For dependency version mismatches, use `pnpm update [package-name]` to update to compatible versions
- For React Native Reanimated issues, ensure version 3.10.1 is used (compatible with current React Native version)
- After updating packages, always run `pnpm generate` to regenerate native code

## Code Style Guidelines

- TypeScript with strict typing throughout
- PascalCase for components/interfaces, camelCase for variables/functions
- Use absolute imports with `@/` prefix
- Group imports: React first, third-party next, internal components last
- Use functional components with hooks
- Redux (Redux Toolkit) for global state, Context for component-level state
- Files named to match their exported component
- Tests end with `.spec.ts` and use descriptive BDD-style naming
- Use Tailwind (twrnc) for styling
- Follow ESLint and Prettier configurations
- Be direct and candid in code reviews and comments
- Provide clear, actionable steps with justifications in implementation approaches