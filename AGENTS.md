# Chatwoot Mobile Development Guidelines

Chatwoot's iOS and Android agent app uses Expo development builds and CNG, React Native, strict TypeScript, Redux Toolkit, React Navigation, twrnc and Reanimated. Read `package.json` and `pnpm-lock.yaml` for versions.

Keep required repository-wide rules in this file. [Coding Guidelines](CODING_GUIDELINES.md) provides optional background.

## Build, Test, and Lint

Run commands at the repository root. Use the pnpm version pinned in `package.json` and the hoisted linker configured in `.npmrc`.

- **Install dependencies**: `pnpm install --frozen-lockfile`
- **Start Metro**: `pnpm start`
- **Build and run**: `pnpm ios` or `pnpm android`
- **Lint**: `pnpm lint`; resolve new warnings, including `react-hooks/exhaustive-deps`.
- **Typecheck**: `pnpm exec tsc --noEmit`
- **Full tests**: `pnpm exec jest --maxWorkers=2` (matches CI).
- **Single spec**: `pnpm exec jest --runInBand --runTestsByPath src/store/label/specs/labelSlice.spec.ts`
- **Dependency and native configuration check**: `pnpm run:doctor`

CircleCI runs Jest only. Run lint and typecheck separately for source changes.

## Project Structure

Preserve the folder structure on `develop`. Do not add top-level folders under `src/` or reorganize working code to fit another convention.

- `App.tsx` → `src/app.tsx`: application entry.
- `src/screens/<feature>/`: screens, feature components, and feature-only hooks or utilities.
- `src/components-next/`: shared UI; `src/svg-icons/`: icons by category.
- `src/store/<domain>/`: `<domain>Actions.ts`, `<domain>Service.ts`, `<domain>Slice.ts`, `<domain>Selectors.ts`, `<domain>Types.ts` and `specs/`. Create only the files needed; register reducers in `src/store/reducers.ts`.
- `src/services/APIService.ts`: shared Chatwoot API client; domain services own endpoint methods.
- `src/types/`: shared domain models; request and response types stay with their store domain.
- `src/hooks.ts`: typed Redux hooks. `src/hooks/` and `src/utils/`: existing shared hooks and helpers. Do not add a `src/hooks/index.ts` that competes with `src/hooks.ts`.
- `src/context/`: UI contexts. `src/navigation/`: stacks, tabs, route types and linking.
- `src/theme/`: shared tailwind instance and tokens. `src/i18n/`: locale JSON.
- `app.config.ts`, root `with-*.js` plugins and `patches/`: durable native configuration.

## Readability and Scope

- Keep changes within the task. Discuss new architecture or product behavior before implementing it.
- Search existing components, hooks, selectors, services and helpers before adding one. Reuse or extract shared logic at its owner; do not duplicate it or create abstractions for hypothetical consumers.
- Before adding or removing retries, locks, caches or other safeguards, identify the caller, reachable failure and invariant being protected.
- Unless already authorized by the task, ask before adding or upgrading dependencies, changing native config, persisted state or migrations, or changing lint, TypeScript, Jest or CI configuration.
- Apply these rules to new and changed code. Fix violations in the logic being changed; leave unrelated legacy violations alone. Remove an existing suppression only with the fix for its underlying offense.
- Add a comment only when clearer code cannot express necessary information; keep the entire comment factual, present tense and no longer than six words. Do not split explanations across comments or add JSDoc prose, banners, history or narration. Put longer rationale in the PR description.
- Preserve required legal notices and existing functional markers; they do not permit new prose or suppressions.
- Keep research notes, prompts, logs and temporary artifacts outside the repository or in an already ignored local directory; do not add them to the working tree.

## TypeScript and Code Style

- Follow nearby maintained files and the configured Prettier and ESLint rules. Change an established style only to fix a concrete problem or satisfy these rules.
- No explicit or implicit `any` in new or changed code, including tests, fixtures and `.d.ts` files. Use precise types, inference, or `unknown` with narrowing.
- No `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`, new lint overrides or ignore entries, weaker compiler settings, or other check bypasses.
- Preserve the existing ESLint `overrides` block for TypeScript linting and `pnpm.overrides` dependency pins.
- Refactor to satisfy checks; never weaken them to make a task pass. If compliance is impossible, explain the conflict and wait for an explicit decision.
- Use `type ComponentProps = { ... }` for new component props. Preserve valid existing interfaces and function syntax; do not introduce `React.FC`.
- Use named exports for new shared components. Preserve screen default exports expected by navigators and existing module contracts.
- Component and model filenames use PascalCase; hooks use `useThing.ts`; other modules use camelCase; folders use kebab-case. Preserve existing names when editing.
- Use `@/` across areas, nearby relative-import conventions within a feature, and `import type` for type-only imports. Extend existing barrels without creating a new barrel solely to shorten imports.
- New application code is TypeScript. Root configuration and plugins retain their existing format; `.js` and `.jsx` are excluded from ESLint here.
- Reuse domain types and constants such as `ConversationStatus`, `ConversationPriority` and `MessageType`.
- Narrow nullable or unknown values with checks. Do not use non-null assertions, double casts or `as never` to hide an invalid contract; a type assertion is not runtime validation.

## React and Hooks

- One React component definition per file; never define a component inside another component. Props, private hooks and non-component helpers may stay with their owner. A render callback is not automatically another component.
- Call hooks at the top level of components or custom hooks, before conditional returns. Keep render free of mutations, requests, timers and storage writes.
- Derive values during render instead of synchronizing duplicate state with effects. Put user-triggered work in event handlers.
- Include every reactive dependency. Restructure the code instead of suppressing dependency warnings or hiding dependencies in refs.
- Effect cleanup removes owned listeners, subscriptions and timers. Use existing cancellation or stale-response handling for async work; obsolete results must not overwrite current state.
- A screen can remain mounted while unfocused. Preserve blur cleanup for focus-bound work, including the search screen's cancellation.
- Use `useMemo`, `useCallback` and `memo` for expensive work or required stable identity, such as memoized children and list renderers; do not add them by default.

## State and API

- Import `useAppDispatch` and `useAppSelector` from `@/hooks`; do not use untyped Redux hooks or import the store into components.
- Keep transient input and view state local. Shared domain state belongs in its existing Redux domain; UI contexts retain their established responsibilities.
- Redux-backed requests use `createAsyncThunk` in the domain's Actions file, calling its Service. Use typed `rejectWithValue` payloads for handled failures.
- Awaiting a dispatched thunk can resolve to a rejected action. Use `.unwrap()` with failure handling or the thunk's `.fulfilled.match(result)` before clearing input, navigating or reporting success.
- Keep reducers pure and state serializable. Generate timestamps and IDs outside reducers; retain `createEntityAdapter` where the domain uses it.
- Put derived domain data in selectors. Use `createSelector` for derived arrays or objects and expensive computation; direct field selectors need no memoization.
- Account API requests go through `apiService`; do not create another client or construct account URLs manually. Preserve separate settings-discovery, analytics and download integrations.
- Reuse `src/utils/camelCaseKeys.ts` at the domain's existing transformation boundary. Preserve snake_case fields required by the API contract.
- `apiService` logs out on 401 and toasts other non-cancelled, current-account errors. Do not add a second toast for the same failure. Catch errors only for a defined recovery or UI state; never swallow them silently.
- Switch accounts through `switchAccount` in `src/utils/accountUtils.ts`. It clears account state; APIService rejects responses and errors for the previous account.
- Increasing `CURRENT_VERSION` in `src/store/index.ts` resets older persisted state, including login. Do not use a version bump as routine migration; explain the user impact before changing persistence.

## Styling, Animation, and Lists

- Import `{ tailwind }` from `@/theme` and use `tailwind.style(...)`. Do not import the twrnc runtime outside the existing theme factory or create another instance.
- Reuse theme tokens and `tailwind.color(...)`; do not introduce hard-coded color values outside theme definitions. Preserve valid nearby StyleSheet usage, including layout styles.
- Use Reanimated and Gesture Handler for animations and gestures. Prefer transform and opacity for movement and fades; never read or write shared values during React render.
- Reuse `useScaleAnimation`, `useHaptic`, and shared `Icon`, `Avatar` and `Button` components. Bottom sheets use `Sheet` from `@/components-next/common/sheet/Sheet`.
- Use FlashList for long lists. The installed API has no `estimatedItemSize` prop; do not add it.
- Provide stable item IDs through `keyExtractor`, stable render callbacks, and `getItemType` for structurally different rows.
- Recycled rows can receive another item without unmounting. Use `useRecyclingState` keyed by item identity for local state that must reset; do not force remounts with item-dependent row keys.

## Navigation, Translations, and Accessibility

- Add routes to the owning navigator's param list and type their screens. Pass IDs instead of domain objects; do not bypass route types with casts.
- Preserve deep-link and push-notification routing, including account switching, when changing routes.
- Use `import i18n from '@/i18n'` and `i18n.t('KEY')` for app-authored user-facing strings, including accessibility labels.
- Reuse translation keys first; add new keys to `src/i18n/en.json` only. Crowdin manages other locales; do not hand-edit them.
- Give interactive controls the correct accessibility role. Icon-only controls also need a localized label naming the action.

## Native Configuration

- `ios/` and `android/` are generated and gitignored. Make durable changes through app config, plugins or package patches; do not hand-edit generated native files.
- `pnpm generate` deletes and regenerates native folders; `pnpm generate:soft` also rewrites native files. Run them only when the task needs prebuild, preserving unrelated local work.
- After native dependency or plugin changes, run `pnpm run:doctor` and rebuild the affected development clients. Metro reload does not apply native changes.
- Install native dependencies with `pnpm exec expo install` to select SDK-compatible versions. Preserve existing patches and dependency pins.
- `EXPO_PUBLIC_*` values used by the app ship in its bundle. Never put secrets there or in source, commit `.env` or credentials, or log tokens and message content.

## Tests and Validation

- Specs use `*.spec.ts` in the owner's `specs/` directory. Reuse domain fixtures and root `__mocks__/`.
- Add or update focused tests for changed store or utility behavior and reachable regressions. Assert observable outcomes; do not add coverage-only tests or a new test framework as a side effect.
- Do not leave focused or skipped tests, weaken assertions, or delete tests to conceal failures.
- **Documentation only**: Check accuracy, formatting, paths, links and consistency.
- **Application logic**: Run lint, typecheck and relevant specs.
- **Shared state, API client or changes across features**: Run lint, typecheck and the full Jest suite.
- **UI**: Run the applicable source checks and exercise affected flows on iOS and Android.
- **Native configuration or dependencies**: Run Doctor, rebuild and exercise affected device flows on each affected platform.
- Report actual commands and outcomes, including failures and unavailable platform checks. Never claim a skipped or interrupted run passed.

## Code Review Rules

- Apply these checks during implementation and review. Review the complete diff against these guidelines.
- Search real callers before calling code unused or broken. Separate reachable defects, rule violations, hypotheses and optional suggestions; bot comments are candidates, not requirements.
- Explain non-obvious choices, their risks and the simpler alternative.

## Commits and Pull Requests

- Branch from `develop` and target `develop` in PRs. Do not commit, push, publish builds or release without authorization. Never force-push or discard someone else's work.
- Use Conventional Commits: `type(scope): subject`, with an optional scope. Never use `--no-verify`.
- Follow the [PR template](.github/PULL_REQUEST_TEMPLATE.md). Explain what changed, why and reproducible verification commands; add screenshots for UI changes.
- Write PR descriptions independently of the working conversation. Raise validation limits with the requester.
- No AI attribution, co-author trailers for assistants, or session/transcript links in code, commits, PRs or issues. Remove such trailers from commits being rewritten before an authorized push.
