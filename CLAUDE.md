# Chatwoot Mobile App Developer Guide

## Build/Lint/Test Commands

- `pnpm test` - Run all Jest tests
- `pnpm lint` - Run ESLint on the codebase
- `npx jest path/to/file.spec.ts` - Run a specific test file
- `npx jest -t "test name pattern"` - Run tests matching a pattern
- `pnpm start` - Start Expo development server
- `pnpm run:ios` - Run on iOS simulator
- `pnpm run:android` - Run on Android emulator
- `pnpm clean` - Clean project
- `pnpm run:storybook` - Run Storybook

## Code Style Guidelines

- TypeScript with strict typing throughout
- PascalCase for components/interfaces, camelCase for variables/functions
- Use absolute imports with `@/` prefix
- Group imports: React first, third-party next, internal components last
- Use functional components with hooks
- Redux (with Redux Toolkit) for global state, Context for component-level state
- Files named to match their exported component
- Tests end with `.spec.ts` and use descriptive BDD-style naming
- Clear error messages when throwing exceptions
- Follow existing patterns for components, hooks, and services
