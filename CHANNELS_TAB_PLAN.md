# Channels Tab Plan

## Goal
Add a new bottom tab (left of Inbox) with the desktop channel icon (`i-lucide-mailbox`), labeled **Channels**. The new tab shows a list of all inbox channels. Selecting a channel resets conversation filters and navigates to the Conversations list filtered by that inbox.

## Scope
- Mobile app only (`chatwoot-mobile-app`).
- New tab + new screen for channel list.
- Reuse existing conversation filters and inbox data.
- No "Unread vs All" toggle work.

## UX Decisions (confirmed)
- Icon: matches desktop `i-lucide-mailbox` (we will add an equivalent SVG in mobile).
- Title: "Channels".
- List content: all inboxes/channels (no "All inboxes" entry).
- Selection behavior: reset conversation filters (assignee/status/sort/inbox) and then apply the selected inbox filter.

## Implementation Steps
1. **Assets & Icons**
   - Create a new SVG icon component for the mailbox icon (outline + filled if needed) under `src/svg-icons/tabs/`.
   - Export in `src/svg-icons/tabs/index.ts` and `src/svg-icons/index.ts`.

2. **Navigation & Tabs**
   - Add a new tab route (e.g., `Channels`) in `src/navigation/tabs/AppTabs.tsx`.
   - Create a new stack for channels (e.g., `ChannelsStack`) in `src/navigation/stack/`.
   - Update `BottomTabBar` to include the new icon in `TabBarIcons`.
   - Adjust tab bar padding (`pl/pr`) if needed for 4 tabs.

3. **Channels Screen (List of Inboxes)**
   - New screen file (e.g., `src/screens/channels/ChannelsScreen.tsx`).
   - Use `selectAllInboxes` to show channels with `getChannelIcon`.
   - Match visual style used in conversation inbox picker (list row layout).
   - Header title "Channels".

4. **Selection Behavior**
   - On tap: dispatch `resetFilters()` from `conversationFilterSlice`, then `setFilters({ key: 'inbox_id', value: inbox.id.toString() })`.
   - Navigate to Conversations tab (likely `navigation.navigate('Conversations')`).

5. **Testing**
   - Run `pnpm test` and report results.
   - If tests are too heavy, at least run a targeted lint/test if available.

6. **Review Package (no PR submission)**
   - Provide diff summary and the list of changed files.
   - Wait for your review before any PR creation or push.

## Risks & Notes
- Verify the correct tab navigation target name (Tabs uses `Conversations`).
- Ensure filter reset does not break persisted filters.
- Ensure list uses available inbox data and renders safely when empty.

## Done When
- New Channels tab appears left of Inbox with mailbox icon.
- Channels list shows all inboxes and navigates to Conversations with filters reset and inbox filter applied.
- Tests run locally and results shared.
- No PR submitted or pushed.
