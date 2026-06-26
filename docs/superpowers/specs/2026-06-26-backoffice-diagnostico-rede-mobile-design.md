# Backoffice → Diagnóstico de rede (mobile) — Design

**Date:** 2026-06-26
**Status:** Approved (design); pending implementation plan.
**Author:** Cesar + Claude

## Summary

Add a **Backoffice** section to the mobile app's Settings, whose first tool is a
native **Diagnóstico de rede** dashboard. The screen reproduces the dark-theme
mockup (`Diagnostico de Rede - Mobile.html`) and is backed by the same n8n
webhook the existing **web backoffice** already consumes
(`/Users/cesaraugusto/synapz/backoffice`):

```
POST <n8n>/webhook/casos-diagnostico-rede
```

with actions `list` / `stats` / `update_status` / `update_comment`, documented in
`agent-isp-n1/tools/listar_casos_diagnostico_rede/README.md`.

The web backoffice is the **source of truth** for the API contract, types, field
mapping and logic; the mobile mockup is the **UX target**. This design ports the
web data layer to React Native and rebuilds the UI to match the mockup.

## Goals / Non-goals

**Goals**

- New `Backoffice` entry in Settings → `BackofficeScreen` (tool menu) →
  `NetworkDiagnosticsScreen`.
- Faithful dark-theme reproduction of the mockup: two tabs (Casos / Resumo),
  client search, filter chips + filter sheet, case cards with a per-case `⋯`
  menu, 8 stat cards, daily stacked-bar trend chart, toast.
- Real wiring for all three case actions: toggle status
  (`pendente ⇄ resolvido`), edit/clear comment, and "abrir caso" (open the
  Chatwoot conversation in-app via `conversation_id`).

**Non-goals (YAGNI — present in the web, dropped for the mobile MVP)**

- Bulk multi-selection / "resolver em massa".
- Feature tour / onboarding.
- Client-info tooltip (login/plano/cidade are folded into the card meta line).
- Status-change confirmation dialog — the toggle is reversible, so we apply
  immediately + toast, matching the mockup.

## Decisions (locked)

1. **Auth = Chatwoot Personal Access Token as Bearer.** Mirror the web client
   (`services/request.ts`): send `Authorization: Bearer <access_token>`, where
   `access_token` is the user's Chatwoot personal access token returned by
   `GET /api/v1/profile`. The mobile app currently persists only the devise
   session headers (`access-token`/`uid`/`client`), which **cannot** authenticate
   the webhook's `/profile` validation and would not resolve the operator name
   used in `edit_history.by`. We therefore **capture `access_token` from the
   profile response** and persist it in auth state.
   - Override of the original picks (devise token) — justified by the proven web
     implementation and the `/profile`-based validation in the webhook.

2. **Webhook host = `https://services.synapz.tech/webhook`** (the web default,
   env `VITE_N8N_BASE_URL`). Mobile mirrors it via a new env var
   `EXPO_PUBLIC_N8N_BASE_URL` (default `https://services.synapz.tech/webhook`).
   Full URL: `${EXPO_PUBLIC_N8N_BASE_URL}/casos-diagnostico-rede`.

3. **Pagination = infinite scroll.** Append the next page on `onEndReached`
   (mobile-native), instead of the web's prev/next buttons. `page_size = 25`.

4. **Comment sheet includes `edit_history`.** Show the note textarea (≤ 2000,
   empty clears) plus "última edição" and a compact, newest-first edit log
   (operator + date), since the data is already returned and is useful for
   accountability.

5. **Date range default = last 7 days** (`from`/`to`), matching the web hook and
   the mockup's 7-day chart. Adjustable in the filter sheet.

6. **Access.** The Backoffice entry is visible to any logged-in user; the backend
   enforces tenancy (`forbidden_account` → 403). No client-side role gate in MVP.

## Architecture

### Navigation & entry point

- `SettingsScreen` (`src/screens/settings/SettingsScreen.tsx`): add a **Backoffice**
  item to the preferences `SettingsList` (chevron, new icon), navigating to
  `BackofficeScreen`.
- `SettingsStack` (`src/navigation/stack/SettingsStack.tsx`): register
  `BackofficeScreen` and `NetworkDiagnosticsScreen`; extend
  `SettingsStackParamList`.
- `BackofficeScreen`: light, Settings-styled list of backoffice tools — today a
  single row "Diagnóstico de rede" → `NetworkDiagnosticsScreen`. Grows later.
- **"Abrir caso"**: `await dispatch(conversationActions.fetchConversation(id))`
  then `navigation.dispatch(StackActions.push('ChatScreen', { conversationId: id,
  isConversationOpenedExternally: true }))` — same pattern as
  `InboxItemContainer`. Shown only when `item.conversation_id` is present.

### Data layer (ported from web, no new dependencies)

`src/services/networkDiagnostics/`:

- `types.ts` — port the web's `network-diagnostics.ts`: `NetworkCase`,
  `NetworkCaseStatus` (`pendente|resolvido`), `NetworkOutcome`,
  `NetworkCaseEditEntry`, `NetworkStats`, `NetworkDayBucket`, list/stats/update
  params + responses, `BoolFilter`/`StatusFilter`.
- `client.ts` — a thin `fetch`-based client (mirrors web `request.ts` +
  `networkDiagnostics.ts`): builds the URL from `EXPO_PUBLIC_N8N_BASE_URL`,
  sets `Authorization: Bearer <pat>` + `Content-Type: application/json`, posts
  `{ action, account_id, ...params }`, throws the `{ success:false, error }`
  string. Functions: `fetchNetworkCases`, `fetchNetworkStats`,
  `updateNetworkCaseStatus`, `updateNetworkCaseComment`.
  - **Not** the existing `apiService` (axios) — that singleton injects devise
    headers, sets `baseURL = installationUrl`, and rewrites paths to
    `api/v1/accounts/{id}/…`. This webhook is a different host + Bearer auth, so
    it needs its own client.
- `getDiagnosticsToken()` — reads the persisted Chatwoot `access_token` from
  auth state (Redux selector). If absent → throw a typed "session" error the
  screen renders as "faça login novamente".

`src/screens/settings/backoffice/network-diagnostics/useNetworkDiagnostics.ts`:

- Port the web hook **without `@tanstack/react-query`** (the app doesn't use it).
  Use `useReducer` for `{ items, stats, page, hasMore, loadingList, loadingStats,
  error, updatingStatus, updateStatusError, updatingComment, updateCommentError }`
  plus filter state. Logic to preserve from the web hook:
  - Defaults: range 7 days, `page_size 25`.
  - Filter setters reset to page 1; `clearFilters` restores defaults.
  - **Infinite scroll**: `loadMore()` fetches `page+1` and **appends** (web
    replaced per page); guard on `hasMore` and in-flight.
  - Stats depend only on `from/to`; refetch on range change.
  - `updateCaseStatus(sk, status)` / `updateCaseComment(sk, comment)`: optimistic
    row patch, then reconcile from the returned `item`; surface errors.
  - `accountId` = `user.account_id` (active account) from auth selectors.

### Field mapping (from the web `NetworkDiagnosticsPage`)

| UI element | Case field |
|---|---|
| Name | `cliente_nome` (fallback "Cliente sem nome") |
| Churn badge | `churn_risk` |
| Outcome badge label/color | `outcome` via `outcomeLabel`/`outcomeModifier` |
| Motivo (description) | `connection_issue_reason` |
| Date | `created_at` ?? `sk.split('#')[0]` |
| Status badge | `status` (legacy/absent → `pendente`) |
| Meta line | `username`/`id_login`, `plano`, `cidade` |
| Open conversation | `conversation_id` |

Outcome map: `instavel_transferido_suporte` → "Instável — transferido ao
suporte" (amber/warning); `offline_transferido_suporte` → "Offline —
transferido ao suporte" (red/danger); `problema_conexao_observado` → "Problema
de conexão observado" (blue/info); other → neutral, raw value.

### UI — `NetworkDiagnosticsScreen` (dark)

Self-contained dark palette from the mockup (not the app's light theme):
bg `#0B1020`, surface `#121A2C`, sheet `#0F1626`, text `#F2F5FB`/`#9AA4B8`,
brand `#4B8DF8`, amber `#F2A93B`, red `#F0524D`, green `#2BD46A`. Implemented via
local style constants (twrnc `tailwind.style` with arbitrary values, or a small
`StyleSheet`).

- **Header**: eyebrow "MONITORAMENTO" + title "Diagnóstico de rede" + `⚙` filter
  button (blue active dot when any filter ≠ default) + tabs **Casos / Resumo**
  (underline active). Plus a back affordance to the Backoffice menu.
- **Casos tab** (`FlashList`):
  - Search input "Buscar cliente" — **client-side** filter over already-loaded
    items (the API has no name param; matches the mockup). Documented limitation:
    only filters loaded pages.
  - Filter chips (horizontal): Todos / Pendentes / Risco / Resolvidos with counts;
    map to `status` (`''`/`pendente`/`resolvido`) and `churn_risk`.
  - "{n} casos" count line.
  - Case card: name, churn badge, outcome badge, motivo, footer (date + comment
    indicator + status badge), `⋯` button → action menu (popover/sheet):
    **Marcar como resolvido/pendente**, **Adicionar/editar comentário**,
    **Abrir caso** (only if `conversation_id`).
  - Empty state; bottom toast.
  - Infinite scroll via `onEndReached` → `loadMore()`; footer spinner.
- **Resumo tab**:
  - 8 stat cards (2-col grid), colored left border:
    Total (brand) · Instáveis (amber) · Offline (red) · Transferidos ao suporte
    (info) · Conexões observadas (green) · Risco de cancelamento (red) ·
    Pendentes (amber) · Resolvidos (green). Values from `stats`.
  - "Acompanhamento" card: legend (Offline/Instáveis/Conexões observadas) +
    **stacked bar chart** built from plain RN `View`s (no chart lib) over
    `stats.by_day` (offline+instaveis+conexao_observada stacked; one bar/day;
    day labels). Falls back to zero-filled days if `by_day` absent.
- **Filter sheet** (`BottomSheetModal`, already used across the app): período
  (preset 7/30 dias + custom `from`/`to`), Desfecho (`outcome`), Problema de
  conexão observado (`connection_issue_observed`), Transferido (`transferido`),
  "Apenas risco de cancelamento" toggle (`churn_risk`), Status. Limpar / "Ver N
  casos".
- **Comment sheet** (`BottomSheetModal`): client name, textarea (≤ 2000, hint
  "envie vazio para limpar", counter), "última edição em …"
  (`comentario_updated_at`), `edit_history` list (newest first: action + by +
  date), Cancelar / Enviar.

### Configuration

- `.env` / `.env.example`: `EXPO_PUBLIC_N8N_BASE_URL=https://services.synapz.tech/webhook`.
- New i18n keys: `SETTINGS.BACKOFFICE`, and a `NETWORK_DIAGNOSTICS.*` namespace
  (title, tabs, chips, stat labels, outcome labels, filter labels, comment/clear
  hints, history strings, errors) in `src/i18n/en.json` + `pt_BR` (Portuguese is
  the product language); other locales fall back to en.

### Auth-state change

- Extend `User` type with `access_token?: string`.
- In the profile/login response handling (`store/auth/authService.ts` /
  `authSlice`), persist `access_token` when present so
  `getDiagnosticsToken()` can read it. The app already re-fetches `/profile`
  (`getProfile`) — capture it there too for existing sessions.

## Data flow

1. Screen mounts → hook resolves `accountId` (auth) + token (auth) → fires
   `list` (page 1) and `stats` (range) in parallel.
2. Filters/chips/period change → reset page 1, refetch `list` (and `stats` if
   range changed).
3. Scroll end → `loadMore` appends next page until `has_more` is false.
4. Status toggle / comment save → POST `update_status`/`update_comment` →
   optimistic patch → reconcile from returned `item` → toast.
5. "Abrir caso" → fetch conversation + push `ChatScreen`.

## Error handling

- Client throws the server `error` string (`invalid_token` 401 /
  `forbidden_account` 403 / `case_not_found` 404 / validation 400).
- Missing/empty token → typed session error → screen prompts re-login.
- Hook exposes `error` (load), `updateStatusError`, `updateCommentError`; the
  screen renders an inline banner for load errors and a toast for action errors,
  keeping the comment sheet open on failure to allow retry.
- Network failure → generic "não foi possível carregar" with a retry affordance.

## Testing

- **Service** (`client.spec.ts`): each action builds the right body
  (`action`/`account_id`/params, `undefined` filters omitted); `Authorization`
  header set; `success:false` body throws the `error`; HTTP error surfaces.
- **Hook** (`useNetworkDiagnostics.spec.ts`): default range/`page_size`; filter
  setters reset page to 1; `loadMore` appends and respects `hasMore`; optimistic
  status/comment patch then reconcile from `item`; error paths set the right
  error field. Mock the client; use the app's existing Jest + RTL setup.

## Risks / open points

- **Auth (highest risk):** validate early that `Authorization: Bearer <pat>`
  authenticates the webhook from the device and that `access_token` is present in
  the mobile `/profile` payload. If the mobile profile omits it, fall back to a
  one-time fetch or surface a clear setup error. (FCM/token note: see
  `memory/fcm-push-testing.md` for token-from-emulator tips.)
- **Webhook host:** confirm `services.synapz.tech/webhook` is reachable from
  mobile networks (the env var makes it trivial to point elsewhere).
- **Client-side search** only covers loaded pages — acceptable for the MVP and
  matches the mockup; revisit if a server-side name filter is added.

## File touch list (anticipated)

- `src/screens/settings/SettingsScreen.tsx` (+ Backoffice item)
- `src/navigation/stack/SettingsStack.tsx` (+ routes, param list)
- `src/screens/settings/backoffice/BackofficeScreen.tsx` (new)
- `src/screens/settings/backoffice/network-diagnostics/` (screen, hook, subviews:
  CaseCard, StatCards, TrendChart, FilterSheet, CommentSheet) (new)
- `src/services/networkDiagnostics/{types,client}.ts` (+ specs) (new)
- `src/store/auth/*` + `src/types/User.ts` (persist `access_token`)
- `src/i18n/en.json`, `src/i18n/pt_BR.json` (new keys)
- `src/svg-icons/*` (Backoffice/diagnostics icon)
- `.env`, `.env.example` (`EXPO_PUBLIC_N8N_BASE_URL`)
