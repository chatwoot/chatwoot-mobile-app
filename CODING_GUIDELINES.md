# Coding guidelines

[AGENTS.md](AGENTS.md) contains the complete required coding and workflow rules.
This companion provides optional background and explanations; it is not a second set of requirements.
Use AGENTS.md for current commands, repository pitfalls, boundaries and verification requirements.

## Understand the change before editing

Read the real entry points, callers, state owners, and relevant existing tests. Inspect two or three
maintained files of the same kind. Establish the behavior being changed, who can use it, and what
happens on success, failure, cancellation, and navigation away where those outcomes apply.

For Chatwoot behavior, check the relevant account, inbox, installation, permissions, and feature
availability. Preserve supported server and platform contracts. Trace all callers before changing
a shared helper's signature or deleting an implementation; similar names can have different owners.

Keep the diff tied to the requested outcome. Do not add new architectures, dependencies, caches,
retries, locks, timeouts, or state machines for imagined future cases. Adding or removing a safeguard
needs a reachable failure, its entry points, and the invariant it protects. Discuss a materially
different architecture or product behavior before building it.

## Keep the existing file organization

- Put feature-only UI, hooks, and helpers beside their existing screen or feature. Promote them to
  a shared location when there is a real shared responsibility or consumer.
- Use `src/components-next/` for shared UI and its established component directories and barrels.
  Keep container/view separation where the feature already uses it; do not create empty layers.
- Preserve Redux feature files under `src/store/<feature>/`. Actions coordinate async operations,
  services handle endpoint work and transformations, slices own state transitions, selectors expose
  state, and types describe feature contracts. Create only the files the feature needs.
- Keep shared domain types in their existing owners or `src/types/`; do not redeclare equivalent
  request, response, or component types in multiple consumers.
- Import typed Redux hooks from `@/hooks`, which resolves to `src/hooks.ts`. Import hooks in
  `src/hooks/` by their concrete paths. Do not add a competing `src/hooks/index.ts` barrel.
- Preserve existing hooks in `src/utils/`, feature folders, and context modules. A naming cleanup
  is not a reason to move their consumers.
- Match nearby filename, export, and function conventions. Component filenames are generally
  PascalCase and component directories kebab-case; retain existing exceptions when editing them.
- Use the established `@/` alias and nearby relative-import conventions. Reuse existing barrels
  when appropriate without adding a barrel solely to shorten an import.

Do not introduce a new `app/`, `features/`, or `lib/` organization, or migrate navigation, styling,
or state libraries as part of a feature or style change. Keep installed versions and package-manager
configuration authoritative; verify dependency compatibility before a deliberately scoped upgrade.

## Keep components focused and reuse real behavior

Define one React component per file, including private helper components. Do not define components
inside another component: their identity changes on render. A component wrapped by `memo` or
`forwardRef` is still one component. A context provider and its custom hook are one component plus
a hook, so they do not require an exception.

Props, local types, and small pure helpers can stay in the component file. Ordinary list render
callbacks and story render callbacks are not automatically additional component definitions; do not
split every callback into a new file. Named UI components belong in their own files.

Search existing components, selectors, services, hooks, and utilities before implementing behavior.
Reuse shared UI primitives and domain transformations. Keep one owner for eligibility checks,
request policy, and derived domain data; repeat a check only when an independent entry point really
bypasses that owner.

Extract pure computation into a plain function and reusable stateful behavior into a custom hook.
Custom hooks share logic, not a single state instance. Keep shared state in its existing owner.
Avoid copying domain logic into another screen, but do not merge superficially similar UI into an
all-purpose component with many switches. Prefer a small explicit interface that serves actual use.

## Preserve type safety

- Introduce no explicit or implicit `any`, including `as any`, generic type arguments, callbacks,
  test helpers, mocks, and declaration files. Reuse accurate domain or library types.
- Use `unknown` for genuinely unknown input and narrow it at the boundary. Validate the fields
  the caller requires before treating external data as a domain value.
- Model meaningful alternatives with unions and discriminants. Preserve nullability and optional
  fields instead of claiming values exist before they have been checked.
- Use inference where the value establishes the type. Add annotations when they clarify a public
  contract, callback, or boundary. New component props use `type ComponentProps`; preserve valid
  existing interfaces and follow surrounding conventions for other types.
- Do not use double assertions, `as never`, or non-null assertions to hide a mismatch. Assertions
  do not perform runtime validation. `as const` and a justified library-boundary assertion are
  different from silencing an error; the value must already satisfy the asserted contract.
- Keep navigation parameters typed through the existing route lists. Correct the route contract
  and its real callers instead of casting an invalid navigation call into acceptance.
- Give untyped integrations an accurate local declaration or adapter with `unknown` and narrowing.
  Do not weaken application types to accommodate one boundary.

Type safety must remain meaningful in tests. Build typed fixtures and mocks that represent the
behavior under test. If a necessary boundary cannot be represented without violating these rules,
raise that concrete conflict and the simpler alternatives; do not conceal it behind an escape hatch.

## Keep comments exceptional

Prefer a clearer name, smaller operation, or explicit type to a comment. Add a comment only for
necessary information that the code cannot express clearly, such as a non-obvious external
constraint. Use **at most six words for the whole comment**, including multi-line comments.

Comments are factual and present tense. Do not restate the next statement, add banners, narrate a
bug fix, describe a conversation, or explain framework-version history. Do not split a long
explanation into several short comments. Put longer rationale in the PR description or relevant
documentation. An accepted risk needs a tracking reference where maintainers can find it.

Preserve existing required legal notices and functional markers used by tools or native plugins.
Their removal can change behavior. This is not permission to add prose or suppression directives;
resolve a concrete new annotation conflict explicitly rather than inventing an exception.

## Use hooks and effects correctly

Call ordinary React hooks at the top level of a component or custom hook, before conditional early
returns. Do not call them from loops, conditions, event handlers, or nested callbacks. Use the
`use` prefix for actual hooks. Keep rendering pure: do not mutate props, state, selector results,
or hook values, and do not start requests, timers, subscriptions, or storage writes during render.

Derive values from current props and state when possible. Do not mirror them into state with an
effect just to keep two copies synchronized. Keep work caused by an interaction in its event
handler. Use effects to synchronize with external systems.

Include every reactive dependency used by an effect, callback, or memo. If the dependency list is
difficult to satisfy, restructure ownership or move the computation; do not suppress the rule,
hide dependencies in refs, or use deep comparison to conceal an ownership problem. Existing
dependency warnings or suppressions do not permit new ones.

Effect cleanup must mirror setup: remove listeners and subscriptions, clear owned timers, and
release resources. For asynchronous work, prevent an obsolete response from overwriting newer
state when the request, account, installation, or lifecycle can change. Use the cancellation or
stale-result mechanism appropriate to the existing API, without adding a second competing owner.

Choose lifecycle deliberately. A React Navigation screen can stay mounted while unfocused. Use
the existing focus lifecycle for focus-bound work and clean it up on blur as well as unmount.
The search screen's blur listener cancels in-flight and debounced searches.

Use `memo`, `useMemo`, and `useCallback` for a demonstrated performance need or a required stable
identity. They are not correctness guarantees. Do not apply them everywhere, remove them merely
because React was upgraded, or assume React Compiler is configured.

These rules follow React's [hook rules](https://react.dev/reference/rules/rules-of-hooks),
[effect guidance](https://react.dev/learn/you-might-not-need-an-effect), and React Navigation's
[focus lifecycle](https://reactnavigation.org/docs/6.x/use-focus-effect/).

## Keep state, requests, and failures at their owners

Use `useAppDispatch` and `useAppSelector` from `@/hooks`. Keep transient input and view state local
when only one component owns it. Shared domain state belongs in the existing Redux feature;
existing contexts keep their established UI responsibilities.

Use existing selectors for derived domain data. Avoid storing a value that can be derived reliably
from existing state. Preserve the reducer keys in `src/store/reducers.ts`; do not invent nested
state based on a conceptual feature grouping. Keep reducers pure and stored values serializable.
Redux Toolkit's Immer-backed draft updates are valid inside its reducers, not outside them.

Use the feature action/service path and `apiService` for account-scoped backend requests. Preserve
account URL construction, authentication, response scoping, and the existing global error handling.
Settings discovery, analytics, downloads, and other integrations have their own existing boundaries;
inspect the relevant path before applying a universal client rule.

Transform external payloads at the existing service boundary instead of repeating conversion in
components. Preserve the difference between transport data and application models. Reuse the
shared client's handling and avoid duplicate notifications; a feature-specific recovery needs an
explicit caller contract.

An awaited `createAsyncThunk` dispatch can resolve with a rejected action. If subsequent work
assumes success, inspect the returned action or use `.unwrap()` with rejection handling before
clearing input, navigating, or displaying success. Preserve user input and existing data when the
operation fails. See [async thunk results](https://redux.js.org/toolkit/api/createAsyncThunk#handling-thunk-results).

Handle loading, empty, failure, cancellation, and retry states where the product requires them.
Catch an error only where there is a defined recovery or useful propagation. Do not convert an
unexpected error into empty data or successful completion. Keep errors observable through the
existing reporting path without logging credentials or customer conversation contents.

Changes to persistence, logout, or account switching must preserve their actual contracts. Inspect
stored shape, migrations, reset behavior, listeners, and consumers before changing a write. Do not
add sensitive information to unencrypted storage or persisted logs, and do not silently migrate
existing storage as an unrelated cleanup.

## Follow the mobile UI and platform conventions

Reuse `tailwind` from `@/theme`, existing tokens, and shared components. Keep nearby `tailwind.style`,
native `StyleSheet`, and animation patterns when appropriate. Avoid duplicating colors, spacing,
or typography that already have a token. Preserve supported themes and use existing icons.

Add user-facing source strings to the appropriate hierarchy in `src/i18n/en.json` and read them
through `@/i18n`. Crowdin manages the other locales; do not invent bulk translations. Account for
long strings and existing pluralization/interpolation conventions in the affected UI.

Interactive controls must expose a meaningful accessible label, role, and state. Check focus,
disabled/loading behavior, text scaling, touch targets, and VoiceOver/TalkBack behavior when those
paths change. Follow the installed React Native version's accessibility APIs and platform behavior.

Check keyboard and safe-area interaction, permission denial, navigation away, and app foreground/
background transitions where the change depends on them. Preserve `.ios.*` and `.android.*`
implementations and keep platform-specific behavior at the existing boundary.

Use the existing list implementation. Provide stable item identities and keep expensive work out
of repeated cell rendering. Where FlashList is used, recycled cell state must track the current
item correctly; do not blindly apply advice written for another list. Measure performance in a
representative release build before adding caches or broad memoization.

Keep durable native changes in `app.config.ts`, existing config plugins, or package patches.
`ios/` and `android/` are generated local projects; a hand edit there is not a durable fix.
Preserve plugin idempotency and exact-version package patches. Do not hand-edit generated files
when their generator is the owner, and do not assume that every generated file is untracked.

## Keep every check meaningful

Do not add `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`, lint overrides, ignore
entries, weaker limits, or warning downgrades. Do not disable validators, change coverage or test
selection to hide failures, submit focused or skipped tests, weaken assertions, or use `--no-verify`.
Refactor the implementation to satisfy the rule. If that is impossible, present the conflict and
alternatives for an explicit decision; changing a standard is separate work.

Keep existing ESLint parser/scoping configuration and dependency pins intact. The TypeScript
`overrides` section enables rules; `pnpm.overrides` controls dependency resolution. Neither is a
reason to remove configuration in the name of eliminating suppressions. Remove an existing
suppression only with the implementation change that makes it unnecessary.

Use the current ESLint and Prettier configuration instead of hand-maintained formatting rules.
Format touched files without creating unrelated churn. The six-word comment limit and one-component
rule are review requirements; this guide does not claim that the current tools enforce every rule.

## Verify behavior and report evidence

Use the commands in [AGENTS.md](AGENTS.md). Match verification to the changed surface:

| Changed surface                              | Verification                                                         |
| -------------------------------------------- | -------------------------------------------------------------------- |
| Documentation only                           | Formatting, local links, accurate paths/commands, and diff review    |
| TypeScript or JavaScript behavior            | Applicable lint, TypeScript checks, and relevant existing Jest specs |
| Shared state, client, or cross-feature logic | The checks above and the full Jest suite                             |
| UI or navigation                             | Relevant automated checks and affected flows on both iOS and Android |
| Native configuration, plugins, or patches    | Doctor, rebuild and device checks for each affected platform         |

Add or adjust focused tests when they protect meaningful changed behavior or reproduce a reachable
regression. Reuse adjacent `specs/`, fixtures, and `__mocks__/` conventions. Assert outcomes and
observable contracts, including relevant failures, rather than private implementation structure.
Use deterministic data and clean up timers, mocks, and subscriptions owned by the test.

Do not add tests solely for line coverage, a formatting change, or to restate the implementation.
Do not add a new testing framework as incidental scaffolding. A snapshot or mocked native module
does not establish device behavior; confirm which implementation the test actually exercises.

Run the required checks after the final relevant change and inspect their results. Investigate
failures before labeling them unrelated or pre-existing. Do not change configuration, delete
assertions, or exclude the failing path to manufacture a pass. If the environment prevents a check,
report the command, reason, and remaining validation clearly.

Review the whole diff against these standards. Distinguish a confirmed reachable defect from a
style violation, hypothesis, or optional improvement. Explain non-obvious choices in plain language
and keep PR descriptions independent of the working conversation. Use the mobile PR template and
reproducible commands; never claim checks or platform testing that did not happen.
