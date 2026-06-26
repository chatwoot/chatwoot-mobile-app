# Backoffice — Network Diagnostics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a **Backoffice** section to Settings whose first tool is a native dark-theme **Diagnóstico de rede** dashboard, backed by the existing n8n webhook `/webhook/casos-diagnostico-rede` (actions `list`/`stats`/`update_status`/`update_comment`).

**Architecture:** A self-contained feature folder. Pure, unit-tested logic (URL config, format helpers, a state-machine reducer, a `fetch` client) is separated from React (a thin hook wrapper + presentational components). Auth reuses the Chatwoot personal `access_token` (captured from `/profile`) sent as `Authorization: Bearer`. The dashboard renders a dark UI with `StyleSheet` + unicode glyphs, reusing the app's `BottomSheetModal`, `FlashList`, and `showToast`.

**Tech Stack:** React Native + Expo, TypeScript, Redux Toolkit (auth/account selectors only), `@shopify/flash-list`, `@gorhom/bottom-sheet`, Jest (no RTL — logic-only unit tests).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-06-26-backoffice-diagnostico-rede-mobile-design.md`.
- Reference implementation (contract source of truth): `/Users/cesaraugusto/synapz/backoffice/src` (`types/network-diagnostics.ts`, `services/networkDiagnostics.ts`, `hooks/useNetworkDiagnostics.ts`, `components/monitoring/NetworkDiagnosticsPage.tsx`).
- Auth: `Authorization: Bearer <user.access_token>` (Chatwoot personal access token). Never log it.
- Webhook base URL: env `EXPO_PUBLIC_N8N_BASE_URL`, default `https://services.synapz.tech/webhook`. Route: `casos-diagnostico-rede`.
- Defaults: date range = last 7 days, `page_size = 25`, infinite scroll, comment ≤ 2000 chars (empty clears).
- `account_id` = active account (`selectCurrentUserAccountId`).
- Tests are plain Jest (`preset: react-native`), pattern per `src/store/auth/specs/authService.spec.ts`. Path alias `@/*` → `src/*`. Bare `i18n` and `@/i18n` both resolve to `src/i18n`.
- Product language is Portuguese; add keys to `en.json`, `pt.json`, `pt_BR.json`.
- Status glyphs/colors (mockup): bg `#0B1020`, surface `#121A2C`, sheet `#0F1626`, border `rgba(255,255,255,0.07)`, text `#F2F5FB`/`#9AA4B8`/`#6B7488`, brand `#4B8DF8`, amber `#F2A93B`, red `#F0524D`, green `#2BD46A`.

---

### Task 1: Webhook URL config

**Files:**
- Modify: `.env`, `.env.example`
- Create: `src/screens/settings/backoffice/network-diagnostics/data/config.ts`
- Test: `src/screens/settings/backoffice/network-diagnostics/data/specs/config.spec.ts`

**Interfaces:**
- Produces: `getNetworkDiagnosticsUrl(): string` — full webhook URL.

- [ ] **Step 1: Write the failing test**

```ts
// data/specs/config.spec.ts
describe('getNetworkDiagnosticsUrl', () => {
  const OLD = process.env.EXPO_PUBLIC_N8N_BASE_URL;
  afterEach(() => { process.env.EXPO_PUBLIC_N8N_BASE_URL = OLD; jest.resetModules(); });

  it('defaults to the services.synapz.tech webhook host', () => {
    delete process.env.EXPO_PUBLIC_N8N_BASE_URL;
    const { getNetworkDiagnosticsUrl } = require('../config');
    expect(getNetworkDiagnosticsUrl()).toBe(
      'https://services.synapz.tech/webhook/casos-diagnostico-rede',
    );
  });

  it('uses the env base and strips a trailing slash', () => {
    process.env.EXPO_PUBLIC_N8N_BASE_URL = 'https://n8n.example.com/webhook/';
    jest.resetModules();
    const { getNetworkDiagnosticsUrl } = require('../config');
    expect(getNetworkDiagnosticsUrl()).toBe(
      'https://n8n.example.com/webhook/casos-diagnostico-rede',
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest network-diagnostics/data/specs/config -i`
Expected: FAIL — cannot find `../config`.

- [ ] **Step 3: Write minimal implementation**

```ts
// data/config.ts
const DEFAULT_BASE_URL = 'https://services.synapz.tech/webhook';

/** n8n webhook base, env-overridable. Trailing slash stripped. */
function baseUrl(): string {
  const raw = process.env.EXPO_PUBLIC_N8N_BASE_URL || DEFAULT_BASE_URL;
  return raw.replace(/\/$/, '');
}

/** Full URL of the network-diagnostics webhook (`POST`). */
export function getNetworkDiagnosticsUrl(): string {
  return `${baseUrl()}/casos-diagnostico-rede`;
}
```

- [ ] **Step 4: Add the env var**

Append to `.env` and `.env.example`:

```
EXPO_PUBLIC_N8N_BASE_URL=https://services.synapz.tech/webhook
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx jest network-diagnostics/data/specs/config -i`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add .env .env.example src/screens/settings/backoffice
git commit -m "feat(backoffice): add network-diagnostics webhook URL config"
```

---

### Task 2: Persist & select the Chatwoot access token

**Files:**
- Modify: `src/types/User.ts`
- Modify: `src/store/auth/authSelectors.ts`
- Test: `src/store/auth/specs/authSelectors.spec.ts` (create if absent)

**Interfaces:**
- Produces: `User.access_token?: string`; `selectAccessToken(state): string | undefined`.
- Note: `authSlice` already spreads the `/profile` and login payloads into `state.user`, so once `access_token` is on the `User` type it is captured with no reducer change.

- [ ] **Step 1: Write the failing test**

```ts
// store/auth/specs/authSelectors.spec.ts
import { selectAccessToken } from '@/store/auth/authSelectors';

const stateWith = (user: unknown) =>
  ({ auth: { user } } as unknown as Parameters<typeof selectAccessToken>[0]);

describe('selectAccessToken', () => {
  it('returns the user access_token', () => {
    expect(selectAccessToken(stateWith({ access_token: 'tok_123' }))).toBe('tok_123');
  });
  it('returns undefined when there is no user', () => {
    expect(selectAccessToken(stateWith(null))).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest authSelectors -i`
Expected: FAIL — `selectAccessToken` is not exported.

- [ ] **Step 3: Add the field and selector**

In `src/types/User.ts`, add to the `User` type (after `email`):

```ts
  /** Chatwoot personal access token (from /profile) — used as Bearer for n8n. */
  access_token?: string;
```

In `src/store/auth/authSelectors.ts`, add:

```ts
export const selectAccessToken = createSelector(selectAuth, auth => auth.user?.access_token);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest authSelectors -i`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/types/User.ts src/store/auth/authSelectors.ts src/store/auth/specs/authSelectors.spec.ts
git commit -m "feat(auth): capture and select Chatwoot personal access_token"
```

---

### Task 3: i18n keys

**Files:**
- Modify: `src/i18n/en.json`, `src/i18n/pt.json`, `src/i18n/pt_BR.json`

**Interfaces:**
- Produces: `SETTINGS.BACKOFFICE`, `BACKOFFICE.*`, and `NETWORK_DIAGNOSTICS.*` key namespaces consumed by all UI tasks.

- [ ] **Step 1: Add the `SETTINGS.BACKOFFICE` key**

In each of `en.json`, `pt.json`, `pt_BR.json`, inside the existing `"SETTINGS"` object add:
- en: `"BACKOFFICE": "Backoffice"`
- pt/pt_BR: `"BACKOFFICE": "Backoffice"`

- [ ] **Step 2: Add the `BACKOFFICE` namespace**

Add a top-level `"BACKOFFICE"` object.
- en: `{ "TITLE": "Backoffice", "SUBTITLE": "Internal tools", "NETWORK_DIAGNOSTICS": "Network diagnostics", "NETWORK_DIAGNOSTICS_DESC": "Instability & outage cases" }`
- pt/pt_BR: `{ "TITLE": "Backoffice", "SUBTITLE": "Ferramentas internas", "NETWORK_DIAGNOSTICS": "Diagnóstico de rede", "NETWORK_DIAGNOSTICS_DESC": "Casos de instabilidade e queda" }`

- [ ] **Step 3: Add the `NETWORK_DIAGNOSTICS` namespace**

Add a top-level `"NETWORK_DIAGNOSTICS"` object. en.json:

```json
"NETWORK_DIAGNOSTICS": {
  "EYEBROW": "MONITORING",
  "TITLE": "Network diagnostics",
  "TAB_CASES": "Cases",
  "TAB_SUMMARY": "Summary",
  "SEARCH_PLACEHOLDER": "Search customer",
  "CHIP_ALL": "All",
  "CHIP_PENDING": "Pending",
  "CHIP_RISK": "Risk",
  "CHIP_RESOLVED": "Resolved",
  "CASES_COUNT": "{count} cases",
  "EMPTY": "No cases found.\nAdjust the search or filters.",
  "CHURN_RISK": "CHURN RISK",
  "ANONYMOUS": "Unnamed customer",
  "OUTCOME_INSTAVEL": "Unstable — transferred to support",
  "OUTCOME_OFFLINE": "Offline — transferred to support",
  "OUTCOME_CONEXAO": "Connection issue observed",
  "STATUS_PENDING": "Pending",
  "STATUS_RESOLVED": "Resolved",
  "MENU_RESOLVE": "Mark as resolved",
  "MENU_REOPEN": "Mark as pending",
  "MENU_COMMENT": "Add comment",
  "MENU_OPEN": "Open case",
  "STAT_TOTAL": "Total cases",
  "STAT_INSTAVEIS": "Unstable",
  "STAT_OFFLINE": "Offline",
  "STAT_TRANSFERIDOS": "Transferred to support",
  "STAT_CONEXAO": "Connections observed",
  "STAT_CHURN": "Cancellation risk",
  "STAT_PENDENTES": "Pending",
  "STAT_RESOLVIDOS": "Resolved",
  "TREND_TITLE": "Follow-up",
  "TREND_SUBTITLE": "Cases per day in the selected period.",
  "LEGEND_OFFLINE": "Offline",
  "LEGEND_INSTAVEIS": "Unstable",
  "LEGEND_CONEXAO": "Connections observed",
  "FILTER_TITLE": "Filter cases",
  "FILTER_PERIOD": "Period",
  "FILTER_PERIOD_7": "7 days",
  "FILTER_PERIOD_30": "30 days",
  "FILTER_STATUS": "Status",
  "FILTER_OUTCOME": "Outcome",
  "FILTER_OUTCOME_ALL": "All outcomes",
  "FILTER_CONNECTION": "Connection issue observed",
  "FILTER_TRANSFERIDO": "Transferred to support",
  "FILTER_CHURN_ONLY": "Cancellation risk only",
  "FILTER_ALL": "All",
  "FILTER_YES": "Yes",
  "FILTER_NO": "No",
  "FILTER_CLEAR": "Clear",
  "FILTER_APPLY": "View {count} cases",
  "COMMENT_TITLE": "Add comment",
  "COMMENT_PLACEHOLDER": "Write a note about this case…",
  "COMMENT_CLEAR_HINT": "Send empty to clear.",
  "COMMENT_COUNTER": "{count}/{max}",
  "COMMENT_UPDATED_AT": "Last edited {date}",
  "COMMENT_CANCEL": "Cancel",
  "COMMENT_SAVE": "Send",
  "HISTORY_TITLE": "Edit history",
  "HISTORY_MARKED_RESOLVED": "Marked as resolved",
  "HISTORY_MARKED_PENDING": "Marked as pending",
  "HISTORY_COMMENT_EDITED": "Comment edited",
  "HISTORY_ENTRY_META": "{by} · {date}",
  "TOAST_RESOLVED": "Case marked as resolved",
  "TOAST_PENDING": "Case marked as pending",
  "TOAST_COMMENT_SAVED": "Comment saved",
  "TOAST_COMMENT_CLEARED": "Comment cleared",
  "ERROR_LOAD": "Could not load cases",
  "ERROR_UPDATE": "Could not update the case",
  "ERROR_NO_SESSION": "Session expired — sign in again",
  "RETRY": "Retry"
}
```

pt.json / pt_BR.json — same keys, Portuguese values (mirror the mockup):
EYEBROW "MONITORAMENTO", TITLE "Diagnóstico de rede", TAB_CASES "Casos", TAB_SUMMARY "Resumo", SEARCH_PLACEHOLDER "Buscar cliente", CHIP_ALL "Todos", CHIP_PENDING "Pendentes", CHIP_RISK "Risco", CHIP_RESOLVED "Resolvidos", CASES_COUNT "{count} casos", EMPTY "Nenhum caso encontrado.\nAjuste a busca ou os filtros.", CHURN_RISK "RISCO DE CANCELAMENTO", ANONYMOUS "Cliente sem nome", OUTCOME_INSTAVEL "Instável — transferido ao suporte", OUTCOME_OFFLINE "Offline — transferido ao suporte", OUTCOME_CONEXAO "Problema de conexão observado", STATUS_PENDING "Pendente", STATUS_RESOLVED "Resolvido", MENU_RESOLVE "Marcar como resolvido", MENU_REOPEN "Marcar como pendente", MENU_COMMENT "Adicionar comentário", MENU_OPEN "Abrir caso", STAT_TOTAL "Total de casos", STAT_INSTAVEIS "Instáveis", STAT_OFFLINE "Offline", STAT_TRANSFERIDOS "Transferidos ao suporte", STAT_CONEXAO "Conexões observadas", STAT_CHURN "Risco de cancelamento", STAT_PENDENTES "Pendentes", STAT_RESOLVIDOS "Resolvidos", TREND_TITLE "Acompanhamento", TREND_SUBTITLE "Casos por dia no período selecionado.", LEGEND_OFFLINE "Offline", LEGEND_INSTAVEIS "Instáveis", LEGEND_CONEXAO "Conexões observadas", FILTER_TITLE "Filtrar casos", FILTER_PERIOD "Período", FILTER_PERIOD_7 "7 dias", FILTER_PERIOD_30 "30 dias", FILTER_STATUS "Status", FILTER_OUTCOME "Desfecho", FILTER_OUTCOME_ALL "Todos os desfechos", FILTER_CONNECTION "Problema de conexão observado", FILTER_TRANSFERIDO "Transferido ao suporte", FILTER_CHURN_ONLY "Apenas risco de cancelamento", FILTER_ALL "Todos", FILTER_YES "Sim", FILTER_NO "Não", FILTER_CLEAR "Limpar", FILTER_APPLY "Ver {count} casos", COMMENT_TITLE "Adicionar comentário", COMMENT_PLACEHOLDER "Escreva uma nota sobre este caso…", COMMENT_CLEAR_HINT "Envie vazio para limpar.", COMMENT_COUNTER "{count}/{max}", COMMENT_UPDATED_AT "Última edição em {date}", COMMENT_CANCEL "Cancelar", COMMENT_SAVE "Enviar", HISTORY_TITLE "Histórico de edições", HISTORY_MARKED_RESOLVED "Marcado como resolvido", HISTORY_MARKED_PENDING "Marcado como pendente", HISTORY_COMMENT_EDITED "Comentário editado", HISTORY_ENTRY_META "{by} · {date}", TOAST_RESOLVED "Caso marcado como resolvido", TOAST_PENDING "Caso marcado como pendente", TOAST_COMMENT_SAVED "Comentário salvo", TOAST_COMMENT_CLEARED "Comentário removido", ERROR_LOAD "Não foi possível carregar os casos", ERROR_UPDATE "Não foi possível atualizar o caso", ERROR_NO_SESSION "Sessão expirada — faça login novamente", RETRY "Tentar novamente".

- [ ] **Step 4: Verify JSON validity**

Run: `node -e "require('./src/i18n/en.json');require('./src/i18n/pt.json');require('./src/i18n/pt_BR.json');console.log('ok')"`
Expected: `ok`.

- [ ] **Step 5: Commit**

```bash
git add src/i18n/en.json src/i18n/pt.json src/i18n/pt_BR.json
git commit -m "feat(backoffice): add i18n keys for network diagnostics"
```

---

### Task 4: Diagnostics types

**Files:**
- Create: `src/screens/settings/backoffice/network-diagnostics/data/types.ts`

**Interfaces:**
- Produces: `NetworkCase`, `NetworkCaseStatus`, `NetworkOutcome`, `NetworkCaseEditEntry`, `NetworkStats`, `NetworkDayBucket`, `NetworkCasesListParams`, `NetworkCasesListResponse`, `NetworkStatsResponse`, `NetworkCaseUpdateStatusResponse`, `NetworkCaseUpdateCommentResponse`, `BoolFilter`, `StatusFilter`.

- [ ] **Step 1: Create the file (port from web reference)**

Copy verbatim from `/Users/cesaraugusto/synapz/backoffice/src/types/network-diagnostics.ts` the type declarations below, EXCLUDING `NetworkCasesFilters` (replaced by the reducer's state). Include exactly:

```ts
// data/types.ts — ported from backoffice/src/types/network-diagnostics.ts
export type NetworkOutcome =
  | 'instavel_transferido_suporte'
  | 'offline_transferido_suporte'
  | 'problema_conexao_observado'
  | (string & {});

export type NetworkCaseStatus = 'pendente' | 'resolvido';

export interface NetworkCase {
  account_id: number;
  sk: string;
  created_at?: string;
  analyzed_at?: string;
  outcome?: NetworkOutcome;
  cliente_nome?: string;
  username?: string;
  id_login?: number;
  id_cliente?: number;
  id_contrato?: number;
  cnpj_cpf?: string;
  plano?: string;
  cidade?: string;
  transferido?: boolean;
  connection_issue_observed?: boolean;
  connection_issue_reason?: string;
  is_unstable?: boolean;
  is_currently_offline?: boolean;
  churn_risk?: boolean;
  conversation_id?: number;
  status?: NetworkCaseStatus;
  status_updated_at?: string;
  comentario?: string;
  comentario_updated_at?: string;
  edit_history?: string;
  [key: string]: unknown;
}

export interface NetworkCaseEditEntry {
  at: string;
  by?: string;
  action: 'status' | 'comentario';
  to?: NetworkCaseStatus;
}

export type BoolFilter = '' | 'true' | 'false';
export type StatusFilter = '' | NetworkCaseStatus;

export interface NetworkCasesListParams {
  from?: string;
  to?: string;
  page?: number;
  page_size?: number;
  outcome?: NetworkOutcome;
  transferido?: boolean;
  connection_issue_observed?: boolean;
  churn_risk?: boolean;
  status?: NetworkCaseStatus;
}

export interface NetworkCasesListResponse {
  success: boolean;
  items: NetworkCase[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  has_more: boolean;
  error?: string;
}

export interface NetworkDayBucket {
  date: string;
  total: number;
  instaveis: number;
  offline: number;
  conexao_observada: number;
  transferido?: number;
}

export interface NetworkStats {
  total: number;
  by_outcome: Record<string, number>;
  transferidos: number;
  conexao_observada: number;
  instaveis: number;
  offline: number;
  churn_risk?: number;
  resolvidos?: number;
  pendentes?: number;
  by_day?: NetworkDayBucket[];
}

export interface NetworkStatsResponse {
  success: boolean;
  stats: NetworkStats;
  error?: string;
}

export interface NetworkCaseUpdateStatusResponse {
  success: boolean;
  item: NetworkCase;
  error?: string;
}

export interface NetworkCaseUpdateCommentResponse {
  success: boolean;
  item: NetworkCase;
  error?: string;
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no new errors from `data/types.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/screens/settings/backoffice/network-diagnostics/data/types.ts
git commit -m "feat(backoffice): add network diagnostics types"
```

---

### Task 5: Format helpers (pure)

**Files:**
- Create: `src/screens/settings/backoffice/network-diagnostics/data/format.ts`
- Test: `src/screens/settings/backoffice/network-diagnostics/data/specs/format.spec.ts`

**Interfaces:**
- Consumes: `types.ts`.
- Produces:
  - `caseStatus(item: NetworkCase): NetworkCaseStatus`
  - `outcomeLabelKey(o?: NetworkOutcome): string` (i18n key or raw string)
  - `outcomeTone(o?: NetworkOutcome): 'warning'|'danger'|'info'|'neutral'`
  - `caseDate(item: NetworkCase): string`
  - `parseEditHistory(raw?: string): NetworkCaseEditEntry[]`
  - `isoDate(daysAgo?: number): string`
  - `zeroFillByDay(from: string, to: string, buckets?: NetworkDayBucket[]): NetworkDayBucket[]`

- [ ] **Step 1: Write the failing test**

```ts
// data/specs/format.spec.ts
import {
  caseStatus, outcomeLabelKey, outcomeTone, caseDate,
  parseEditHistory, isoDate, zeroFillByDay,
} from '../format';

describe('caseStatus', () => {
  it('returns resolvido only when explicitly set', () => {
    expect(caseStatus({ status: 'resolvido' } as never)).toBe('resolvido');
    expect(caseStatus({ status: 'pendente' } as never)).toBe('pendente');
    expect(caseStatus({} as never)).toBe('pendente'); // legacy -> pendente
  });
});

describe('outcomeLabelKey / outcomeTone', () => {
  it('maps known outcomes', () => {
    expect(outcomeLabelKey('instavel_transferido_suporte')).toBe('NETWORK_DIAGNOSTICS.OUTCOME_INSTAVEL');
    expect(outcomeTone('instavel_transferido_suporte')).toBe('warning');
    expect(outcomeTone('offline_transferido_suporte')).toBe('danger');
    expect(outcomeTone('problema_conexao_observado')).toBe('info');
  });
  it('falls back for unknown outcomes', () => {
    expect(outcomeLabelKey('weird')).toBe('weird');
    expect(outcomeTone('weird')).toBe('neutral');
    expect(outcomeLabelKey(undefined)).toBe('—');
  });
});

describe('caseDate', () => {
  it('uses created_at then sk prefix, else dash', () => {
    expect(caseDate({ created_at: '2026-06-25T09:26:00.000Z' } as never)).not.toBe('—');
    expect(caseDate({ sk: '2026-06-25T09:26:00.000Z#abc' } as never)).not.toBe('—');
    expect(caseDate({} as never)).toBe('—');
  });
});

describe('parseEditHistory', () => {
  it('parses arrays and tolerates junk', () => {
    expect(parseEditHistory('[{"at":"x","action":"status","to":"resolvido"}]')).toHaveLength(1);
    expect(parseEditHistory(undefined)).toEqual([]);
    expect(parseEditHistory('not json')).toEqual([]);
    expect(parseEditHistory('{"a":1}')).toEqual([]);
  });
});

describe('isoDate', () => {
  it('returns YYYY-MM-DD and respects daysAgo ordering', () => {
    expect(isoDate(0)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(isoDate(6) < isoDate(0)).toBe(true);
  });
});

describe('zeroFillByDay', () => {
  it('produces one ascending bucket per day, filling gaps with zeros', () => {
    const out = zeroFillByDay('2026-06-01', '2026-06-03', [
      { date: '2026-06-02', total: 5, instaveis: 2, offline: 1, conexao_observada: 2, transferido: 1 },
    ]);
    expect(out.map(b => b.date)).toEqual(['2026-06-01', '2026-06-02', '2026-06-03']);
    expect(out[0].total).toBe(0);
    expect(out[1].total).toBe(5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest network-diagnostics/data/specs/format -i`
Expected: FAIL — cannot find `../format`.

- [ ] **Step 3: Write the implementation**

```ts
// data/format.ts
import type {
  NetworkCase, NetworkCaseStatus, NetworkOutcome,
  NetworkCaseEditEntry, NetworkDayBucket,
} from './types';

export function caseStatus(item: NetworkCase): NetworkCaseStatus {
  return item.status === 'resolvido' ? 'resolvido' : 'pendente';
}

export function outcomeLabelKey(outcome?: NetworkOutcome): string {
  switch (outcome) {
    case 'instavel_transferido_suporte': return 'NETWORK_DIAGNOSTICS.OUTCOME_INSTAVEL';
    case 'offline_transferido_suporte': return 'NETWORK_DIAGNOSTICS.OUTCOME_OFFLINE';
    case 'problema_conexao_observado': return 'NETWORK_DIAGNOSTICS.OUTCOME_CONEXAO';
    default: return outcome || '—';
  }
}

export function outcomeTone(outcome?: NetworkOutcome): 'warning' | 'danger' | 'info' | 'neutral' {
  switch (outcome) {
    case 'instavel_transferido_suporte': return 'warning';
    case 'offline_transferido_suporte': return 'danger';
    case 'problema_conexao_observado': return 'info';
    default: return 'neutral';
  }
}

const DATE_FMT = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

export function caseDate(item: NetworkCase): string {
  const raw = item.created_at || item.sk?.split('#')[0];
  if (!raw) return '—';
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? '—' : DATE_FMT.format(d);
}

export function parseEditHistory(raw?: string): NetworkCaseEditEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as NetworkCaseEditEntry[]) : [];
  } catch {
    return [];
  }
}

/** `YYYY-MM-DD` for `daysAgo` before today, in local time. */
export function isoDate(daysAgo = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

const EMPTY_BUCKET = (date: string): NetworkDayBucket => ({
  date, total: 0, instaveis: 0, offline: 0, conexao_observada: 0, transferido: 0,
});

/** One ascending bucket per day in [from, to], filling gaps with zeros. */
export function zeroFillByDay(
  from: string, to: string, buckets: NetworkDayBucket[] = [],
): NetworkDayBucket[] {
  const bySorted = new Map(buckets.map(b => [b.date, b]));
  const out: NetworkDayBucket[] = [];
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return [...buckets].sort((a, b) => a.date.localeCompare(b.date));
  }
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    out.push(bySorted.get(key) ?? EMPTY_BUCKET(key));
  }
  return out;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest network-diagnostics/data/specs/format -i`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/screens/settings/backoffice/network-diagnostics/data/format.ts src/screens/settings/backoffice/network-diagnostics/data/specs/format.spec.ts
git commit -m "feat(backoffice): add network diagnostics format helpers"
```

---

### Task 6: Webhook client (fetch)

**Files:**
- Create: `src/screens/settings/backoffice/network-diagnostics/data/client.ts`
- Test: `src/screens/settings/backoffice/network-diagnostics/data/specs/client.spec.ts`

**Interfaces:**
- Consumes: `types.ts`, `getNetworkDiagnosticsUrl` (Task 1).
- Produces:
  - `fetchNetworkCases(token, accountId, params): Promise<NetworkCasesListResponse>`
  - `fetchNetworkStats(token, accountId, from?, to?): Promise<NetworkStatsResponse>`
  - `updateNetworkCaseStatus(token, accountId, sk, status): Promise<NetworkCaseUpdateStatusResponse>`
  - `updateNetworkCaseComment(token, accountId, sk, comentario): Promise<NetworkCaseUpdateCommentResponse>`
  - All throw `Error(error)` on `success:false` / HTTP error.

- [ ] **Step 1: Write the failing test**

```ts
// data/specs/client.spec.ts
import {
  fetchNetworkCases, fetchNetworkStats,
  updateNetworkCaseStatus, updateNetworkCaseComment,
} from '../client';

const okJson = (body: unknown) =>
  Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) } as Response);

describe('network diagnostics client', () => {
  beforeEach(() => { global.fetch = jest.fn(); });
  afterEach(() => { jest.restoreAllMocks(); });

  it('posts a list body with bearer auth and omits undefined filters', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okJson({ success: true, items: [], page: 1, page_size: 25, total: 0, total_pages: 0, has_more: false }));
    await fetchNetworkCases('tok', 4, { from: '2026-06-01', to: '2026-06-07', page: 2, page_size: 25, churn_risk: undefined, status: 'pendente' });
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer tok');
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({ action: 'list', account_id: 4, page: 2, status: 'pendente' });
    expect('churn_risk' in body).toBe(false);
  });

  it('sends the stats action', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okJson({ success: true, stats: { total: 0, by_outcome: {}, transferidos: 0, conexao_observada: 0, instaveis: 0, offline: 0 } }));
    await fetchNetworkStats('tok', 4, '2026-06-01', '2026-06-07');
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body).toEqual({ action: 'stats', account_id: 4, from: '2026-06-01', to: '2026-06-07' });
  });

  it('sends update_status and update_comment actions', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okJson({ success: true, item: { account_id: 4, sk: 's' } }));
    await updateNetworkCaseStatus('tok', 4, 's', 'resolvido');
    expect(JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)).toEqual({ action: 'update_status', account_id: 4, sk: 's', status: 'resolvido' });
    await updateNetworkCaseComment('tok', 4, 's', 'nota');
    expect(JSON.parse((global.fetch as jest.Mock).mock.calls[1][1].body)).toEqual({ action: 'update_comment', account_id: 4, sk: 's', comentario: 'nota' });
  });

  it('throws the server error on success:false', async () => {
    (global.fetch as jest.Mock).mockReturnValue(okJson({ success: false, error: 'forbidden_account' }));
    await expect(fetchNetworkCases('tok', 9, {})).rejects.toThrow('forbidden_account');
  });

  it('throws on a non-ok HTTP response', async () => {
    (global.fetch as jest.Mock).mockReturnValue(Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({ error: 'invalid_token' }) } as Response));
    await expect(fetchNetworkStats('tok', 4)).rejects.toThrow('invalid_token');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest network-diagnostics/data/specs/client -i`
Expected: FAIL — cannot find `../client`.

- [ ] **Step 3: Write the implementation**

```ts
// data/client.ts
import { getNetworkDiagnosticsUrl } from './config';
import type {
  NetworkCaseStatus, NetworkCasesListParams, NetworkCasesListResponse,
  NetworkStatsResponse, NetworkCaseUpdateStatusResponse, NetworkCaseUpdateCommentResponse,
} from './types';

function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

async function postAction<T extends { success: boolean; error?: string }>(
  token: string, body: Record<string, unknown>, fallback: string,
): Promise<T> {
  const response = await fetch(getNetworkDiagnosticsUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

  let data: T | undefined;
  try { data = (await response.json()) as T; } catch { data = undefined; }

  if (!response.ok) {
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }
  if (!data?.success) {
    throw new Error(data?.error || fallback);
  }
  return data;
}

export function fetchNetworkCases(
  token: string, accountId: number, params: NetworkCasesListParams = {},
): Promise<NetworkCasesListResponse> {
  return postAction<NetworkCasesListResponse>(
    token, compact({ action: 'list', account_id: accountId, ...params }),
    'Failed to list network diagnostic cases.',
  );
}

export function fetchNetworkStats(
  token: string, accountId: number, from?: string, to?: string,
): Promise<NetworkStatsResponse> {
  return postAction<NetworkStatsResponse>(
    token, compact({ action: 'stats', account_id: accountId, from, to }),
    'Failed to load network diagnostic stats.',
  );
}

export function updateNetworkCaseStatus(
  token: string, accountId: number, sk: string, status: NetworkCaseStatus,
): Promise<NetworkCaseUpdateStatusResponse> {
  return postAction<NetworkCaseUpdateStatusResponse>(
    token, { action: 'update_status', account_id: accountId, sk, status },
    'Failed to update case status.',
  );
}

export function updateNetworkCaseComment(
  token: string, accountId: number, sk: string, comentario: string,
): Promise<NetworkCaseUpdateCommentResponse> {
  return postAction<NetworkCaseUpdateCommentResponse>(
    token, { action: 'update_comment', account_id: accountId, sk, comentario },
    'Failed to update case comment.',
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest network-diagnostics/data/specs/client -i`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/screens/settings/backoffice/network-diagnostics/data/client.ts src/screens/settings/backoffice/network-diagnostics/data/specs/client.spec.ts
git commit -m "feat(backoffice): add network diagnostics webhook client"
```

---

### Task 7: State reducer (pure) + search

**Files:**
- Create: `src/screens/settings/backoffice/network-diagnostics/data/reducer.ts`
- Test: `src/screens/settings/backoffice/network-diagnostics/data/specs/reducer.spec.ts`

**Interfaces:**
- Consumes: `types.ts`, `isoDate` (Task 5).
- Produces:
  - `DiagnosticsState` (shape below), `initialState(): DiagnosticsState`
  - `diagnosticsReducer(state, action): DiagnosticsState`
  - Action creators are plain objects with a `type` field (union `DiagnosticsAction`).
  - `searchCases(items, query): NetworkCase[]` (client-side name filter)
  - `chipCounts(stats): { all; pending; risk; resolved }`
  - `DEFAULT_PAGE_SIZE = 25`, `DEFAULT_RANGE_DAYS = 7`

- [ ] **Step 1: Write the failing test**

```ts
// data/specs/reducer.spec.ts
import {
  initialState, diagnosticsReducer, searchCases, chipCounts, DEFAULT_PAGE_SIZE,
} from '../reducer';
import type { NetworkCase } from '../types';

const caseItem = (sk: string, extra: Partial<NetworkCase> = {}): NetworkCase =>
  ({ account_id: 4, sk, ...extra });

describe('diagnosticsReducer', () => {
  it('starts with a 7-day range, page 1 and the default page size', () => {
    const s = initialState();
    expect(s.page).toBe(1);
    expect(s.pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(s.from < s.to || s.from <= s.to).toBe(true);
  });

  it('LIST_SUCCESS replaces items when not appending', () => {
    let s = initialState();
    s = diagnosticsReducer(s, { type: 'LIST_SUCCESS', append: false, response: { success: true, items: [caseItem('a')], page: 1, page_size: 25, total: 1, total_pages: 1, has_more: false } });
    expect(s.items.map(i => i.sk)).toEqual(['a']);
    expect(s.loadingList).toBe(false);
  });

  it('LIST_SUCCESS appends on subsequent pages', () => {
    let s = initialState();
    s = diagnosticsReducer(s, { type: 'LIST_SUCCESS', append: false, response: { success: true, items: [caseItem('a')], page: 1, page_size: 25, total: 2, total_pages: 2, has_more: true } });
    s = diagnosticsReducer(s, { type: 'LIST_SUCCESS', append: true, response: { success: true, items: [caseItem('b')], page: 2, page_size: 25, total: 2, total_pages: 2, has_more: false } });
    expect(s.items.map(i => i.sk)).toEqual(['a', 'b']);
    expect(s.hasMore).toBe(false);
    expect(s.page).toBe(2);
  });

  it('SET_FILTER resets the page to 1', () => {
    let s = { ...initialState(), page: 4 };
    s = diagnosticsReducer(s, { type: 'SET_FILTER', key: 'status', value: 'resolvido' });
    expect(s.page).toBe(1);
    expect(s.status).toBe('resolvido');
  });

  it('PATCH_CASE replaces the matching item by sk', () => {
    let s = { ...initialState(), items: [caseItem('a', { status: 'pendente' })] };
    s = diagnosticsReducer(s, { type: 'PATCH_CASE', item: caseItem('a', { status: 'resolvido' }) });
    expect(s.items[0].status).toBe('resolvido');
  });

  it('CLEAR_FILTERS restores defaults', () => {
    let s = { ...initialState(), status: 'resolvido' as const, churnRisk: 'true' as const, page: 3 };
    s = diagnosticsReducer(s, { type: 'CLEAR_FILTERS' });
    expect(s.status).toBe('');
    expect(s.churnRisk).toBe('');
    expect(s.page).toBe(1);
  });
});

describe('searchCases', () => {
  const items = [caseItem('a', { cliente_nome: 'Fábio Ribeiro' }), caseItem('b', { cliente_nome: 'Ana Alves' })];
  it('filters by name case-insensitively and returns all when empty', () => {
    expect(searchCases(items, 'fab').map(i => i.sk)).toEqual(['a']);
    expect(searchCases(items, '')).toHaveLength(2);
  });
});

describe('chipCounts', () => {
  it('reads counts from stats with safe fallbacks', () => {
    expect(chipCounts({ total: 10, by_outcome: {}, transferidos: 0, conexao_observada: 0, instaveis: 0, offline: 0, pendentes: 6, resolvidos: 4, churn_risk: 2 }))
      .toEqual({ all: 10, pending: 6, risk: 2, resolved: 4 });
    expect(chipCounts(null)).toEqual({ all: 0, pending: 0, risk: 0, resolved: 0 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest network-diagnostics/data/specs/reducer -i`
Expected: FAIL — cannot find `../reducer`.

- [ ] **Step 3: Write the implementation**

```ts
// data/reducer.ts
import { isoDate } from './format';
import type {
  BoolFilter, NetworkCase, NetworkCasesListResponse, NetworkOutcome,
  NetworkStats, StatusFilter,
} from './types';

export const DEFAULT_PAGE_SIZE = 25;
export const DEFAULT_RANGE_DAYS = 7;

export interface DiagnosticsState {
  from: string;
  to: string;
  outcome: NetworkOutcome | '';
  transferido: BoolFilter;
  connectionIssueObserved: BoolFilter;
  churnRisk: BoolFilter;
  status: StatusFilter;
  page: number;
  pageSize: number;
  items: NetworkCase[];
  total: number;
  hasMore: boolean;
  stats: NetworkStats | null;
  loadingList: boolean;
  loadingStats: boolean;
  error: string | null;
}

export type FilterKey =
  | 'outcome' | 'transferido' | 'connectionIssueObserved' | 'churnRisk' | 'status';

export type DiagnosticsAction =
  | { type: 'SET_RANGE'; from: string; to: string }
  | { type: 'SET_FILTER'; key: FilterKey; value: string }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_PAGE'; page: number }
  | { type: 'LIST_LOADING' }
  | { type: 'LIST_SUCCESS'; append: boolean; response: NetworkCasesListResponse }
  | { type: 'LIST_ERROR'; error: string }
  | { type: 'STATS_LOADING' }
  | { type: 'STATS_SUCCESS'; stats: NetworkStats }
  | { type: 'STATS_ERROR'; error: string }
  | { type: 'PATCH_CASE'; item: NetworkCase };

export function initialState(): DiagnosticsState {
  return {
    from: isoDate(DEFAULT_RANGE_DAYS - 1),
    to: isoDate(0),
    outcome: '',
    transferido: '',
    connectionIssueObserved: '',
    churnRisk: '',
    status: '',
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    items: [],
    total: 0,
    hasMore: false,
    stats: null,
    loadingList: false,
    loadingStats: false,
    error: null,
  };
}

export function diagnosticsReducer(
  state: DiagnosticsState, action: DiagnosticsAction,
): DiagnosticsState {
  switch (action.type) {
    case 'SET_RANGE':
      return { ...state, from: action.from, to: action.to, page: 1 };
    case 'SET_FILTER':
      return { ...state, [action.key]: action.value, page: 1 } as DiagnosticsState;
    case 'CLEAR_FILTERS':
      return {
        ...state,
        from: isoDate(DEFAULT_RANGE_DAYS - 1),
        to: isoDate(0),
        outcome: '', transferido: '', connectionIssueObserved: '',
        churnRisk: '', status: '', page: 1,
      };
    case 'SET_PAGE':
      return { ...state, page: action.page };
    case 'LIST_LOADING':
      return { ...state, loadingList: true, error: null };
    case 'LIST_SUCCESS':
      return {
        ...state,
        loadingList: false,
        page: action.response.page,
        total: action.response.total,
        hasMore: action.response.has_more,
        items: action.append
          ? [...state.items, ...action.response.items]
          : action.response.items,
      };
    case 'LIST_ERROR':
      return { ...state, loadingList: false, error: action.error };
    case 'STATS_LOADING':
      return { ...state, loadingStats: true };
    case 'STATS_SUCCESS':
      return { ...state, loadingStats: false, stats: action.stats };
    case 'STATS_ERROR':
      return { ...state, loadingStats: false, error: action.error };
    case 'PATCH_CASE':
      return {
        ...state,
        items: state.items.map(i => (i.sk === action.item.sk ? action.item : i)),
      };
    default:
      return state;
  }
}

/** Client-side name search over already-loaded items (API has no name param). */
export function searchCases(items: NetworkCase[], query: string): NetworkCase[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(i => (i.cliente_nome || '').toLowerCase().includes(q));
}

export function chipCounts(stats: NetworkStats | null): {
  all: number; pending: number; risk: number; resolved: number;
} {
  return {
    all: stats?.total ?? 0,
    pending: stats?.pendentes ?? 0,
    risk: stats?.churn_risk ?? 0,
    resolved: stats?.resolvidos ?? 0,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest network-diagnostics/data/specs/reducer -i`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/screens/settings/backoffice/network-diagnostics/data/reducer.ts src/screens/settings/backoffice/network-diagnostics/data/specs/reducer.spec.ts
git commit -m "feat(backoffice): add network diagnostics state reducer"
```

---

### Task 8: useNetworkDiagnostics hook (React wrapper)

**Files:**
- Create: `src/screens/settings/backoffice/network-diagnostics/useNetworkDiagnostics.ts`

**Interfaces:**
- Consumes: `client.ts`, `reducer.ts`, auth selectors `selectAccessToken` (Task 2), `selectCurrentUserAccountId`.
- Produces hook return: `{ state: DiagnosticsState; setRange; setFilter; clearFilters; loadMore; refresh; toggleStatus(sk, current); saveComment(sk, comentario); updatingSk; ready }`.
- This file is a thin React wrapper (no unit test — repo convention).

- [ ] **Step 1: Write the implementation**

```ts
// useNetworkDiagnostics.ts
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useAppSelector } from '@/hooks';
import { selectAccessToken, selectCurrentUserAccountId } from '@/store/auth/authSelectors';
import {
  fetchNetworkCases, fetchNetworkStats,
  updateNetworkCaseStatus, updateNetworkCaseComment,
} from './data/client';
import {
  diagnosticsReducer, initialState, type DiagnosticsState, type FilterKey,
} from './data/reducer';
import type { NetworkCaseStatus } from './data/types';

function boolParam(v: '' | 'true' | 'false'): boolean | undefined {
  return v === '' ? undefined : v === 'true';
}
const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));

export interface UseNetworkDiagnostics {
  state: DiagnosticsState;
  ready: boolean;
  setRange: (from: string, to: string) => void;
  setFilter: (key: FilterKey, value: string) => void;
  clearFilters: () => void;
  loadMore: () => void;
  refresh: () => void;
  toggleStatus: (sk: string, current: NetworkCaseStatus) => Promise<void>;
  saveComment: (sk: string, comentario: string) => Promise<void>;
  updatingSk: string | null;
}

export function useNetworkDiagnostics(): UseNetworkDiagnostics {
  const token = useAppSelector(selectAccessToken);
  const accountId = useAppSelector(selectCurrentUserAccountId) ?? null;
  const ready = Boolean(token && accountId);

  const [state, dispatch] = useReducer(diagnosticsReducer, undefined, initialState);
  const [updatingSk, setUpdatingSk] = useState<string | null>(null);
  const inFlight = useRef(false);

  const listParams = useCallback(() => ({
    from: state.from, to: state.to, page: state.page, page_size: state.pageSize,
    outcome: state.outcome || undefined,
    transferido: boolParam(state.transferido),
    connection_issue_observed: boolParam(state.connectionIssueObserved),
    churn_risk: boolParam(state.churnRisk),
    status: state.status || undefined,
  }), [state.from, state.to, state.page, state.pageSize, state.outcome,
       state.transferido, state.connectionIssueObserved, state.churnRisk, state.status]);

  // List: refetch (replace) whenever filters/page-1 change.
  const filtersKey = JSON.stringify({
    from: state.from, to: state.to, outcome: state.outcome, transferido: state.transferido,
    connectionIssueObserved: state.connectionIssueObserved, churnRisk: state.churnRisk, status: state.status,
  });
  useEffect(() => {
    if (!ready) return;
    let active = true;
    dispatch({ type: 'LIST_LOADING' });
    fetchNetworkCases(token as string, accountId as number, { ...listParams(), page: 1 })
      .then(r => active && dispatch({ type: 'LIST_SUCCESS', append: false, response: r }))
      .catch(e => active && dispatch({ type: 'LIST_ERROR', error: msg(e) }));
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, token, accountId, filtersKey]);

  // Stats: only depend on the date range.
  useEffect(() => {
    if (!ready) return;
    let active = true;
    dispatch({ type: 'STATS_LOADING' });
    fetchNetworkStats(token as string, accountId as number, state.from, state.to)
      .then(r => active && dispatch({ type: 'STATS_SUCCESS', stats: r.stats }))
      .catch(e => active && dispatch({ type: 'STATS_ERROR', error: msg(e) }));
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, token, accountId, state.from, state.to]);

  const setRange = useCallback((from: string, to: string) =>
    dispatch({ type: 'SET_RANGE', from, to }), []);
  const setFilter = useCallback((key: FilterKey, value: string) =>
    dispatch({ type: 'SET_FILTER', key, value }), []);
  const clearFilters = useCallback(() => dispatch({ type: 'CLEAR_FILTERS' }), []);

  const loadMore = useCallback(() => {
    if (!ready || !state.hasMore || state.loadingList || inFlight.current) return;
    inFlight.current = true;
    const nextPage = state.page + 1;
    dispatch({ type: 'LIST_LOADING' });
    fetchNetworkCases(token as string, accountId as number, { ...listParams(), page: nextPage })
      .then(r => dispatch({ type: 'LIST_SUCCESS', append: true, response: r }))
      .catch(e => dispatch({ type: 'LIST_ERROR', error: msg(e) }))
      .finally(() => { inFlight.current = false; });
  }, [ready, token, accountId, state.hasMore, state.loadingList, state.page, listParams]);

  const refresh = useCallback(() => {
    if (!ready) return;
    dispatch({ type: 'SET_PAGE', page: 1 });
    dispatch({ type: 'LIST_LOADING' });
    fetchNetworkCases(token as string, accountId as number, { ...listParams(), page: 1 })
      .then(r => dispatch({ type: 'LIST_SUCCESS', append: false, response: r }))
      .catch(e => dispatch({ type: 'LIST_ERROR', error: msg(e) }));
    dispatch({ type: 'STATS_LOADING' });
    fetchNetworkStats(token as string, accountId as number, state.from, state.to)
      .then(r => dispatch({ type: 'STATS_SUCCESS', stats: r.stats }))
      .catch(e => dispatch({ type: 'STATS_ERROR', error: msg(e) }));
  }, [ready, token, accountId, state.from, state.to, listParams]);

  const toggleStatus = useCallback(async (sk: string, current: NetworkCaseStatus) => {
    if (!ready) return;
    setUpdatingSk(sk);
    try {
      const next: NetworkCaseStatus = current === 'resolvido' ? 'pendente' : 'resolvido';
      const r = await updateNetworkCaseStatus(token as string, accountId as number, sk, next);
      dispatch({ type: 'PATCH_CASE', item: r.item });
    } finally {
      setUpdatingSk(null);
    }
  }, [ready, token, accountId]);

  const saveComment = useCallback(async (sk: string, comentario: string) => {
    if (!ready) return;
    setUpdatingSk(sk);
    try {
      const r = await updateNetworkCaseComment(token as string, accountId as number, sk, comentario);
      dispatch({ type: 'PATCH_CASE', item: r.item });
    } finally {
      setUpdatingSk(null);
    }
  }, [ready, token, accountId]);

  return { state, ready, setRange, setFilter, clearFilters, loadMore, refresh, toggleStatus, saveComment, updatingSk };
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no new errors. (Confirm `useAppSelector` is exported from `@/hooks` — it is, per `SettingsScreen.tsx`.)

- [ ] **Step 3: Commit**

```bash
git add src/screens/settings/backoffice/network-diagnostics/useNetworkDiagnostics.ts
git commit -m "feat(backoffice): add useNetworkDiagnostics hook"
```

---

### Task 9: Dark theme tokens + StatCards

**Files:**
- Create: `src/screens/settings/backoffice/network-diagnostics/ui/theme.ts`
- Create: `src/screens/settings/backoffice/network-diagnostics/ui/StatCards.tsx`

**Interfaces:**
- Consumes: `NetworkStats`.
- Produces: `colors` (palette), `tone(name)` color resolver; `StatCards({ stats, loading })` React component.

- [ ] **Step 1: Create the theme tokens**

```ts
// ui/theme.ts
export const colors = {
  bg: '#0B1020',
  surface: '#121A2C',
  sheet: '#0F1626',
  menu: '#1B2438',
  border: 'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.1)',
  text: '#F2F5FB',
  textDim: '#9AA4B8',
  textMuted: '#6B7488',
  eyebrow: '#5C6680',
  brand: '#4B8DF8',
  amber: '#F2A93B',
  red: '#F0524D',
  green: '#2BD46A',
};

export type Tone = 'brand' | 'warning' | 'danger' | 'info' | 'success' | 'churn' | 'neutral';

export function tone(name: Tone): string {
  switch (name) {
    case 'brand': return colors.brand;
    case 'warning': return colors.amber;
    case 'danger': return colors.red;
    case 'info': return colors.brand;
    case 'success': return colors.green;
    case 'churn': return colors.red;
    default: return colors.textDim;
  }
}
```

- [ ] **Step 2: Create the StatCards component**

```tsx
// ui/StatCards.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import i18n from 'i18n';
import type { NetworkStats } from '../data/types';
import { colors, tone, type Tone } from './theme';

interface Props { stats: NetworkStats | null; loading: boolean; }

const CARDS: { key: keyof NetworkStats | 'total'; toneName: Tone; label: string }[] = [
  { key: 'total', toneName: 'brand', label: 'STAT_TOTAL' },
  { key: 'instaveis', toneName: 'warning', label: 'STAT_INSTAVEIS' },
  { key: 'offline', toneName: 'danger', label: 'STAT_OFFLINE' },
  { key: 'transferidos', toneName: 'info', label: 'STAT_TRANSFERIDOS' },
  { key: 'conexao_observada', toneName: 'success', label: 'STAT_CONEXAO' },
  { key: 'churn_risk', toneName: 'churn', label: 'STAT_CHURN' },
  { key: 'pendentes', toneName: 'warning', label: 'STAT_PENDENTES' },
  { key: 'resolvidos', toneName: 'success', label: 'STAT_RESOLVIDOS' },
];

export function StatCards({ stats, loading }: Props): JSX.Element {
  return (
    <View style={styles.grid}>
      {CARDS.map(card => {
        const color = tone(card.toneName);
        const value = stats ? (stats[card.key as keyof NetworkStats] as number | undefined) : undefined;
        return (
          <View key={String(card.key)} style={[styles.card, { borderLeftColor: color }]}>
            <Text style={styles.label}>{i18n.t(`NETWORK_DIAGNOSTICS.${card.label}`)}</Text>
            <Text style={[styles.value, { color }]}>
              {loading || value === undefined ? '—' : value}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11, paddingHorizontal: 20, paddingTop: 18 },
  card: {
    width: '47%', flexGrow: 1, backgroundColor: colors.surface, borderRadius: 14,
    paddingVertical: 13, paddingHorizontal: 14, borderLeftWidth: 3, gap: 7,
    borderWidth: 1, borderColor: colors.border,
  },
  label: { fontSize: 11.5, color: colors.textDim, fontWeight: '500' },
  value: { fontSize: 27, fontWeight: '700' },
});
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/screens/settings/backoffice/network-diagnostics/ui/theme.ts src/screens/settings/backoffice/network-diagnostics/ui/StatCards.tsx
git commit -m "feat(backoffice): add dark theme tokens and stat cards"
```

---

### Task 10: TrendChart

**Files:**
- Create: `src/screens/settings/backoffice/network-diagnostics/ui/TrendChart.tsx`

**Interfaces:**
- Consumes: `NetworkStats`, `zeroFillByDay` (Task 5), `colors`.
- Produces: `TrendChart({ stats, from, to })` — stacked bar chart from `stats.by_day`.

- [ ] **Step 1: Create the component**

```tsx
// ui/TrendChart.tsx
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import i18n from 'i18n';
import type { NetworkStats } from '../data/types';
import { zeroFillByDay } from '../data/format';
import { colors } from './theme';

interface Props { stats: NetworkStats | null; from: string; to: string; }

const CHART_HEIGHT = 130;

/** `YYYY-MM-DD` -> `DD/MM`. */
function dayLabel(date: string): string {
  const [, m, d] = date.split('-');
  return d && m ? `${d}/${m}` : date;
}

export function TrendChart({ stats, from, to }: Props): JSX.Element {
  const days = useMemo(() => zeroFillByDay(from, to, stats?.by_day), [from, to, stats?.by_day]);
  const max = Math.max(1, ...days.map(d => d.total));

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{i18n.t('NETWORK_DIAGNOSTICS.TREND_TITLE')}</Text>
      <Text style={styles.subtitle}>{i18n.t('NETWORK_DIAGNOSTICS.TREND_SUBTITLE')}</Text>
      <View style={styles.legend}>
        <Legend color={colors.red} label={i18n.t('NETWORK_DIAGNOSTICS.LEGEND_OFFLINE')} />
        <Legend color={colors.amber} label={i18n.t('NETWORK_DIAGNOSTICS.LEGEND_INSTAVEIS')} />
        <Legend color={colors.green} label={i18n.t('NETWORK_DIAGNOSTICS.LEGEND_CONEXAO')} />
      </View>
      <View style={styles.bars}>
        {days.map(day => {
          const h = (n: number) => Math.round((n / max) * CHART_HEIGHT);
          return (
            <View key={day.date} style={styles.barColumn}>
              <View style={{ height: h(day.conexao_observada), backgroundColor: colors.green, borderTopLeftRadius: 3, borderTopRightRadius: 3 }} />
              <View style={{ height: h(day.instaveis), backgroundColor: colors.amber }} />
              <View style={{ height: h(day.offline), backgroundColor: colors.red, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 }} />
            </View>
          );
        })}
      </View>
      <View style={styles.labels}>
        {days.map(day => (
          <Text key={day.date} style={styles.dayLabel} numberOfLines={1}>{dayLabel(day.date)}</Text>
        ))}
      </View>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }): JSX.Element {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16, marginHorizontal: 20, marginTop: 14, marginBottom: 32 },
  title: { fontSize: 14.5, fontWeight: '600', color: colors.text },
  subtitle: { fontSize: 11.5, color: colors.textDim, marginTop: 3 },
  legend: { flexDirection: 'row', gap: 14, marginTop: 12, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 2 },
  legendText: { fontSize: 10.5, color: colors.textDim },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: CHART_HEIGHT, marginTop: 16 },
  barColumn: { flex: 1, flexDirection: 'column', justifyContent: 'flex-end', height: '100%' },
  labels: { flexDirection: 'row', gap: 8, marginTop: 9 },
  dayLabel: { flex: 1, textAlign: 'center', fontSize: 10, color: colors.eyebrow },
});
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/screens/settings/backoffice/network-diagnostics/ui/TrendChart.tsx
git commit -m "feat(backoffice): add trend chart"
```

---

### Task 11: CaseCard + action menu

**Files:**
- Create: `src/screens/settings/backoffice/network-diagnostics/ui/CaseCard.tsx`

**Interfaces:**
- Consumes: `NetworkCase`, format helpers, `colors`.
- Produces: `CaseCard({ item, busy, onToggleStatus, onComment, onOpen })`. `onOpen` is `undefined` when the case has no `conversation_id` (hides "Abrir caso").

- [ ] **Step 1: Create the component**

```tsx
// ui/CaseCard.tsx
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import i18n from 'i18n';
import type { NetworkCase } from '../data/types';
import { caseDate, caseStatus, outcomeLabelKey, outcomeTone } from '../data/format';
import { colors } from './theme';

interface Props {
  item: NetworkCase;
  busy: boolean;
  onToggleStatus: () => void;
  onComment: () => void;
  onOpen?: () => void;
}

const TONE_BG: Record<string, string> = {
  warning: 'rgba(242,169,59,0.14)', danger: 'rgba(240,82,77,0.14)',
  info: 'rgba(75,141,248,0.14)', neutral: 'rgba(255,255,255,0.05)',
};
const TONE_FG: Record<string, string> = {
  warning: colors.amber, danger: colors.red, info: '#7FB0FF', neutral: colors.textDim,
};

export function CaseCard({ item, busy, onToggleStatus, onComment, onOpen }: Props): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);
  const status = caseStatus(item);
  const resolved = status === 'resolvido';
  const t = outcomeTone(item.outcome);
  const label = outcomeLabelKey(item.outcome);
  const close = () => setMenuOpen(false);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.identity}>
          <Text style={styles.name}>{item.cliente_nome || i18n.t('NETWORK_DIAGNOSTICS.ANONYMOUS')}</Text>
          {item.churn_risk && (
            <Text style={styles.churn}>⚠ {i18n.t('NETWORK_DIAGNOSTICS.CHURN_RISK')}</Text>
          )}
          <Text style={[styles.outcome, { backgroundColor: TONE_BG[t], color: TONE_FG[t] }]}>
            {label.startsWith('NETWORK_DIAGNOSTICS.') ? i18n.t(label) : label}
          </Text>
        </View>
        <Pressable style={styles.menuBtn} onPress={() => setMenuOpen(o => !o)} accessibilityLabel="Ações">
          <Text style={styles.menuGlyph}>⋯</Text>
        </Pressable>
      </View>

      <Text style={styles.reason}>{item.connection_issue_reason || '—'}</Text>

      <View style={styles.footer}>
        <Text style={styles.date}>{caseDate(item)}</Text>
        <View style={styles.footerRight}>
          {!!item.comentario && <Text style={styles.commentDot}>💬</Text>}
          <Text style={[styles.statusBadge, resolved ? styles.statusResolved : styles.statusPending]}>
            {resolved ? i18n.t('NETWORK_DIAGNOSTICS.STATUS_RESOLVED') : i18n.t('NETWORK_DIAGNOSTICS.STATUS_PENDING')}
          </Text>
        </View>
      </View>

      {menuOpen && (
        <>
          <Pressable style={styles.backdrop} onPress={close} />
          <View style={styles.menu}>
            <MenuItem
              color={colors.green}
              glyph={resolved ? '↺' : '✓'}
              label={resolved ? i18n.t('NETWORK_DIAGNOSTICS.MENU_REOPEN') : i18n.t('NETWORK_DIAGNOSTICS.MENU_RESOLVE')}
              disabled={busy}
              onPress={() => { close(); onToggleStatus(); }}
            />
            <MenuItem
              color={colors.text} glyph="💬" label={i18n.t('NETWORK_DIAGNOSTICS.MENU_COMMENT')}
              disabled={busy} onPress={() => { close(); onComment(); }}
            />
            {onOpen && (
              <MenuItem
                color={colors.text} glyph="↗" label={i18n.t('NETWORK_DIAGNOSTICS.MENU_OPEN')}
                disabled={false} onPress={() => { close(); onOpen(); }}
              />
            )}
          </View>
        </>
      )}
    </View>
  );
}

function MenuItem({ color, glyph, label, disabled, onPress }: {
  color: string; glyph: string; label: string; disabled: boolean; onPress: () => void;
}): JSX.Element {
  return (
    <Pressable style={styles.menuItem} onPress={onPress} disabled={disabled}>
      <Text style={[styles.menuItemGlyph, { color }]}>{glyph}</Text>
      <Text style={[styles.menuItemLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 15, padding: 14, gap: 11 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  identity: { flex: 1, gap: 9, minWidth: 0 },
  name: { fontSize: 15, fontWeight: '600', color: '#EAEFF8', lineHeight: 19 },
  churn: { alignSelf: 'flex-start', backgroundColor: 'rgba(240,82,77,0.14)', color: '#FF7A75', fontSize: 10, fontWeight: '700', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 7, overflow: 'hidden' },
  outcome: { alignSelf: 'flex-start', fontSize: 11, fontWeight: '600', paddingVertical: 4, paddingHorizontal: 9, borderRadius: 7, overflow: 'hidden' },
  menuBtn: { width: 34, height: 34, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  menuGlyph: { color: '#AEB8CC', fontSize: 18, lineHeight: 18 },
  reason: { fontSize: 12.5, lineHeight: 18, color: colors.textDim },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, paddingTop: 3 },
  date: { fontSize: 11.5, color: colors.textMuted },
  footerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  commentDot: { fontSize: 11 },
  statusBadge: { fontSize: 11, fontWeight: '600', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, overflow: 'hidden' },
  statusPending: { backgroundColor: 'rgba(242,169,59,0.14)', color: colors.amber },
  statusResolved: { backgroundColor: 'rgba(43,212,106,0.14)', color: colors.green },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 8 },
  menu: { position: 'absolute', top: 46, right: 14, zIndex: 9, width: 220, backgroundColor: colors.menu, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 12, padding: 6 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, paddingHorizontal: 12, borderRadius: 8 },
  menuItemGlyph: { width: 18, textAlign: 'center', fontSize: 14 },
  menuItemLabel: { fontSize: 13.5, fontWeight: '500' },
});
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/screens/settings/backoffice/network-diagnostics/ui/CaseCard.tsx
git commit -m "feat(backoffice): add case card with action menu"
```

---

### Task 12: FilterSheet

**Files:**
- Create: `src/screens/settings/backoffice/network-diagnostics/ui/FilterSheet.tsx`

**Interfaces:**
- Consumes: `BottomSheetModal` (from `@gorhom/bottom-sheet`), the hook's filter state + setters, `colors`, `isoDate`.
- Produces: `FilterSheet` (forwardRef to `BottomSheetModal`) with props `{ state, setRange, setFilter, clearFilters, total, onClose }`.

- [ ] **Step 1: Create the component**

```tsx
// ui/FilterSheet.tsx
import React, { forwardRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import i18n from 'i18n';
import { isoDate } from '../data/format';
import { DEFAULT_RANGE_DAYS, type DiagnosticsState, type FilterKey } from '../data/reducer';
import { colors } from './theme';

interface Props {
  state: DiagnosticsState;
  setRange: (from: string, to: string) => void;
  setFilter: (key: FilterKey, value: string) => void;
  clearFilters: () => void;
  total: number;
  onClose: () => void;
}

type Opt = { value: string; label: string };

const boolOptions: Opt[] = [
  { value: '', label: 'NETWORK_DIAGNOSTICS.FILTER_ALL' },
  { value: 'true', label: 'NETWORK_DIAGNOSTICS.FILTER_YES' },
  { value: 'false', label: 'NETWORK_DIAGNOSTICS.FILTER_NO' },
];
const statusOptions: Opt[] = [
  { value: '', label: 'NETWORK_DIAGNOSTICS.FILTER_ALL' },
  { value: 'pendente', label: 'NETWORK_DIAGNOSTICS.STATUS_PENDING' },
  { value: 'resolvido', label: 'NETWORK_DIAGNOSTICS.STATUS_RESOLVED' },
];
const outcomeOptions: Opt[] = [
  { value: '', label: 'NETWORK_DIAGNOSTICS.FILTER_OUTCOME_ALL' },
  { value: 'instavel_transferido_suporte', label: 'NETWORK_DIAGNOSTICS.OUTCOME_INSTAVEL' },
  { value: 'offline_transferido_suporte', label: 'NETWORK_DIAGNOSTICS.OUTCOME_OFFLINE' },
  { value: 'problema_conexao_observado', label: 'NETWORK_DIAGNOSTICS.OUTCOME_CONEXAO' },
];

function Segmented({ value, options, onChange }: { value: string; options: Opt[]; onChange: (v: string) => void }): JSX.Element {
  return (
    <View style={styles.segment}>
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <Pressable key={opt.value} style={[styles.segmentItem, active && styles.segmentItemActive]} onPress={() => onChange(opt.value)}>
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{i18n.t(opt.label)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const FilterSheet = forwardRef<BottomSheetModal, Props>(function FilterSheet(
  { state, setRange, setFilter, clearFilters, total, onClose }, ref,
) {
  return (
    <BottomSheetModal
      ref={ref}
      enablePanDownToClose
      snapPoints={['85%']}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.sheetBg}
    >
      <BottomSheetScrollView contentContainerStyle={styles.body}>
        <Text style={styles.title}>{i18n.t('NETWORK_DIAGNOSTICS.FILTER_TITLE')}</Text>

        <Text style={styles.section}>{i18n.t('NETWORK_DIAGNOSTICS.FILTER_PERIOD')}</Text>
        <Segmented
          value={state.from === isoDate(29) ? '30' : '7'}
          options={[
            { value: '7', label: 'NETWORK_DIAGNOSTICS.FILTER_PERIOD_7' },
            { value: '30', label: 'NETWORK_DIAGNOSTICS.FILTER_PERIOD_30' },
          ]}
          onChange={v => setRange(isoDate(v === '30' ? 29 : DEFAULT_RANGE_DAYS - 1), isoDate(0))}
        />

        <Text style={styles.section}>{i18n.t('NETWORK_DIAGNOSTICS.FILTER_STATUS')}</Text>
        <Segmented value={state.status} options={statusOptions} onChange={v => setFilter('status', v)} />

        <Text style={styles.section}>{i18n.t('NETWORK_DIAGNOSTICS.FILTER_OUTCOME')}</Text>
        <Segmented value={state.outcome} options={outcomeOptions} onChange={v => setFilter('outcome', v)} />

        <Text style={styles.section}>{i18n.t('NETWORK_DIAGNOSTICS.FILTER_CONNECTION')}</Text>
        <Segmented value={state.connectionIssueObserved} options={boolOptions} onChange={v => setFilter('connectionIssueObserved', v)} />

        <Text style={styles.section}>{i18n.t('NETWORK_DIAGNOSTICS.FILTER_TRANSFERIDO')}</Text>
        <Segmented value={state.transferido} options={boolOptions} onChange={v => setFilter('transferido', v)} />

        <Pressable style={styles.toggleRow} onPress={() => setFilter('churnRisk', state.churnRisk === 'true' ? '' : 'true')}>
          <Text style={styles.toggleLabel}>{i18n.t('NETWORK_DIAGNOSTICS.FILTER_CHURN_ONLY')}</Text>
          <View style={[styles.track, state.churnRisk === 'true' && styles.trackOn]}>
            <View style={[styles.knob, state.churnRisk === 'true' && styles.knobOn]} />
          </View>
        </Pressable>

        <View style={styles.actions}>
          <Pressable style={styles.clearBtn} onPress={clearFilters}>
            <Text style={styles.clearText}>{i18n.t('NETWORK_DIAGNOSTICS.FILTER_CLEAR')}</Text>
          </Pressable>
          <Pressable style={styles.applyBtn} onPress={onClose}>
            <Text style={styles.applyText}>{i18n.t('NETWORK_DIAGNOSTICS.FILTER_APPLY').replace('{count}', String(total))}</Text>
          </Pressable>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  sheetBg: { backgroundColor: colors.sheet },
  handle: { backgroundColor: 'rgba(255,255,255,0.18)', width: 38 },
  body: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 18 },
  section: { fontSize: 12, color: colors.textDim, fontWeight: '600', marginBottom: 10, marginTop: 16 },
  segment: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  segmentItem: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  segmentItemActive: { backgroundColor: 'rgba(75,141,248,0.18)', borderColor: 'rgba(75,141,248,0.55)' },
  segmentText: { fontSize: 13, fontWeight: '600', color: '#8A93A8' },
  segmentTextActive: { color: '#A8C8FF' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 11, padding: 14, marginTop: 24 },
  toggleLabel: { color: '#EAEFF8', fontSize: 13.5, fontWeight: '500' },
  track: { width: 44, height: 25, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center' },
  trackOn: { backgroundColor: colors.brand },
  knob: { width: 19, height: 19, borderRadius: 999, backgroundColor: '#fff', marginLeft: 3 },
  knobOn: { marginLeft: 22 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 24 },
  clearBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 13, padding: 15, alignItems: 'center' },
  clearText: { color: '#C7D0E0', fontSize: 14, fontWeight: '600' },
  applyBtn: { flex: 2, backgroundColor: colors.brand, borderRadius: 13, padding: 15, alignItems: 'center' },
  applyText: { color: '#06122B', fontSize: 14, fontWeight: '700' },
});
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/screens/settings/backoffice/network-diagnostics/ui/FilterSheet.tsx
git commit -m "feat(backoffice): add filter bottom sheet"
```

---

### Task 13: CommentSheet

**Files:**
- Create: `src/screens/settings/backoffice/network-diagnostics/ui/CommentSheet.tsx`

**Interfaces:**
- Consumes: `BottomSheetModal`, `NetworkCase`, `parseEditHistory`, `caseDate`/date format, `colors`.
- Produces: `CommentSheet` (forwardRef) props `{ item, saving, onSave(text), onClose }`. Internal draft state; `onSave` receives the trimmed text (empty clears).

- [ ] **Step 1: Create the component**

```tsx
// ui/CommentSheet.tsx
import React, { forwardRef, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import i18n from 'i18n';
import type { NetworkCase, NetworkCaseEditEntry } from '../data/types';
import { parseEditHistory } from '../data/format';
import { colors } from './theme';

const MAX = 2000;

interface Props {
  item: NetworkCase | null;
  saving: boolean;
  onSave: (text: string) => void;
  onClose: () => void;
}

function actionLabel(entry: NetworkCaseEditEntry): string {
  if (entry.action === 'status') {
    return entry.to === 'resolvido'
      ? i18n.t('NETWORK_DIAGNOSTICS.HISTORY_MARKED_RESOLVED')
      : i18n.t('NETWORK_DIAGNOSTICS.HISTORY_MARKED_PENDING');
  }
  return i18n.t('NETWORK_DIAGNOSTICS.HISTORY_COMMENT_EDITED');
}

export const CommentSheet = forwardRef<BottomSheetModal, Props>(function CommentSheet(
  { item, saving, onSave, onClose }, ref,
) {
  const [draft, setDraft] = useState('');
  useEffect(() => { setDraft(item?.comentario ?? ''); }, [item?.sk, item?.comentario]);

  const history = item ? parseEditHistory(item.edit_history).slice().reverse() : [];

  return (
    <BottomSheetModal
      ref={ref}
      enablePanDownToClose
      snapPoints={['70%']}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.sheetBg}
      keyboardBehavior="interactive"
    >
      <BottomSheetScrollView contentContainerStyle={styles.body}>
        <Text style={styles.title}>{i18n.t('NETWORK_DIAGNOSTICS.COMMENT_TITLE')}</Text>
        <Text style={styles.client}>{item?.cliente_nome || i18n.t('NETWORK_DIAGNOSTICS.ANONYMOUS')}</Text>

        <BottomSheetTextInput
          style={styles.textarea}
          multiline
          maxLength={MAX}
          value={draft}
          onChangeText={setDraft}
          editable={!saving}
          placeholder={i18n.t('NETWORK_DIAGNOSTICS.COMMENT_PLACEHOLDER')}
          placeholderTextColor="#5C6680"
        />
        <View style={styles.metaRow}>
          <Text style={styles.hint}>{i18n.t('NETWORK_DIAGNOSTICS.COMMENT_CLEAR_HINT')}</Text>
          <Text style={styles.counter}>
            {i18n.t('NETWORK_DIAGNOSTICS.COMMENT_COUNTER').replace('{count}', String(draft.length)).replace('{max}', String(MAX))}
          </Text>
        </View>

        {history.length > 0 && (
          <View style={styles.history}>
            <Text style={styles.historyTitle}>{i18n.t('NETWORK_DIAGNOSTICS.HISTORY_TITLE')}</Text>
            {history.map((entry, idx) => (
              <View key={idx} style={styles.historyItem}>
                <Text style={styles.historyAction}>{actionLabel(entry)}</Text>
                <Text style={styles.historyMeta}>
                  {i18n.t('NETWORK_DIAGNOSTICS.HISTORY_ENTRY_META').replace('{by}', entry.by || '—').replace('{date}', entry.at || '—')}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actions}>
          <Pressable style={styles.cancelBtn} onPress={onClose} disabled={saving}>
            <Text style={styles.cancelText}>{i18n.t('NETWORK_DIAGNOSTICS.COMMENT_CANCEL')}</Text>
          </Pressable>
          <Pressable style={styles.saveBtn} onPress={() => onSave(draft.trim())} disabled={saving}>
            {saving ? <ActivityIndicator color="#06122B" /> : <Text style={styles.saveText}>{i18n.t('NETWORK_DIAGNOSTICS.COMMENT_SAVE')}</Text>}
          </Pressable>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  sheetBg: { backgroundColor: colors.sheet },
  handle: { backgroundColor: 'rgba(255,255,255,0.18)', width: 38 },
  body: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  client: { fontSize: 12.5, color: colors.textDim, marginTop: 5, marginBottom: 14 },
  textarea: { minHeight: 120, backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 13, padding: 14, color: '#E8ECF4', fontSize: 14.5, textAlignVertical: 'top' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  hint: { fontSize: 11.5, color: colors.textMuted },
  counter: { fontSize: 11.5, color: colors.textMuted },
  history: { marginTop: 18, gap: 8 },
  historyTitle: { fontSize: 12, fontWeight: '600', color: colors.textDim },
  historyItem: { gap: 2 },
  historyAction: { fontSize: 13, color: '#E8ECF4' },
  historyMeta: { fontSize: 11, color: colors.textMuted },
  actions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  cancelBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 13, padding: 15, alignItems: 'center' },
  cancelText: { color: '#C7D0E0', fontSize: 14, fontWeight: '600' },
  saveBtn: { flex: 2, backgroundColor: colors.brand, borderRadius: 13, padding: 15, alignItems: 'center' },
  saveText: { color: '#06122B', fontSize: 14, fontWeight: '700' },
});
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no new errors. (If `BottomSheetTextInput` is unavailable in the installed version, replace with RN `TextInput`.)

- [ ] **Step 3: Commit**

```bash
git add src/screens/settings/backoffice/network-diagnostics/ui/CommentSheet.tsx
git commit -m "feat(backoffice): add comment bottom sheet with history"
```

---

### Task 14: NetworkDiagnosticsScreen (composition)

**Files:**
- Create: `src/screens/settings/backoffice/network-diagnostics/NetworkDiagnosticsScreen.tsx`

**Interfaces:**
- Consumes: `useNetworkDiagnostics`, `searchCases`/`chipCounts` (reducer), all `ui/*` components, `showToast` (`@/utils/toastUtils`), navigation (`StackActions`), `conversationActions.fetchConversation`, `useAppDispatch`.
- Produces: default-exported screen component `NetworkDiagnosticsScreen`.

- [ ] **Step 1: Create the screen**

```tsx
// NetworkDiagnosticsScreen.tsx
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { StackActions, useNavigation } from '@react-navigation/native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import i18n from 'i18n';
import { useAppDispatch } from '@/hooks';
import { conversationActions } from '@/store/conversation/conversationActions';
import { showToast } from '@/utils/toastUtils';
import { useNetworkDiagnostics } from './useNetworkDiagnostics';
import { chipCounts, searchCases } from './data/reducer';
import { caseStatus } from './data/format';
import type { NetworkCase } from './data/types';
import { colors } from './ui/theme';
import { StatCards } from './ui/StatCards';
import { TrendChart } from './ui/TrendChart';
import { CaseCard } from './ui/CaseCard';
import { FilterSheet } from './ui/FilterSheet';
import { CommentSheet } from './ui/CommentSheet';

type Tab = 'casos' | 'resumo';
type Chip = { key: string; labelKey: string; count: number; active: boolean; onPress: () => void };

export default function NetworkDiagnosticsScreen(): JSX.Element {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const nd = useNetworkDiagnostics();
  const { state, setRange, setFilter, clearFilters, loadMore, toggleStatus, saveComment, updatingSk } = nd;

  const [tab, setTab] = useState<Tab>('casos');
  const [search, setSearch] = useState('');
  const [commentCase, setCommentCase] = useState<NetworkCase | null>(null);

  const filterRef = useRef<BottomSheetModal>(null);
  const commentRef = useRef<BottomSheetModal>(null);

  const counts = useMemo(() => chipCounts(state.stats), [state.stats]);
  const visibleCases = useMemo(() => searchCases(state.items, search), [state.items, search]);

  const filterActive = state.status !== '' || state.outcome !== '' || state.churnRisk !== '' ||
    state.transferido !== '' || state.connectionIssueObserved !== '';

  const chips: Chip[] = [
    { key: 'all', labelKey: 'CHIP_ALL', count: counts.all, active: state.status === '' && state.churnRisk !== 'true', onPress: () => { setFilter('status', ''); setFilter('churnRisk', ''); } },
    { key: 'pending', labelKey: 'CHIP_PENDING', count: counts.pending, active: state.status === 'pendente', onPress: () => setFilter('status', 'pendente') },
    { key: 'risk', labelKey: 'CHIP_RISK', count: counts.risk, active: state.churnRisk === 'true', onPress: () => setFilter('churnRisk', state.churnRisk === 'true' ? '' : 'true') },
    { key: 'resolved', labelKey: 'CHIP_RESOLVED', count: counts.resolved, active: state.status === 'resolvido', onPress: () => setFilter('status', 'resolvido') },
  ];

  const onToggleStatus = useCallback(async (item: NetworkCase) => {
    const current = caseStatus(item);
    try {
      await toggleStatus(item.sk, current);
      showToast({ message: i18n.t(current === 'resolvido' ? 'NETWORK_DIAGNOSTICS.TOAST_PENDING' : 'NETWORK_DIAGNOSTICS.TOAST_RESOLVED') });
    } catch {
      showToast({ message: i18n.t('NETWORK_DIAGNOSTICS.ERROR_UPDATE') });
    }
  }, [toggleStatus]);

  const onOpenCase = useCallback(async (item: NetworkCase) => {
    if (!item.conversation_id) return;
    await dispatch(conversationActions.fetchConversation(item.conversation_id));
    navigation.dispatch(StackActions.push('ChatScreen', {
      conversationId: item.conversation_id,
      isConversationOpenedExternally: true,
    }));
  }, [dispatch, navigation]);

  const openComment = useCallback((item: NetworkCase) => {
    setCommentCase(item);
    commentRef.current?.present();
  }, []);

  const onSaveComment = useCallback(async (text: string) => {
    if (!commentCase) return;
    try {
      await saveComment(commentCase.sk, text);
      commentRef.current?.dismiss();
      showToast({ message: i18n.t(text ? 'NETWORK_DIAGNOSTICS.TOAST_COMMENT_SAVED' : 'NETWORK_DIAGNOSTICS.TOAST_COMMENT_CLEARED') });
    } catch {
      showToast({ message: i18n.t('NETWORK_DIAGNOSTICS.ERROR_UPDATE') });
    }
  }, [commentCase, saveComment]);

  const renderHeader = () => (
    <>
      <View style={styles.searchRow}>
        <Text style={styles.searchGlyph}>⌕</Text>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={i18n.t('NETWORK_DIAGNOSTICS.SEARCH_PLACEHOLDER')}
          placeholderTextColor="#5C6680"
        />
        {!!search && <Pressable onPress={() => setSearch('')}><Text style={styles.clearGlyph}>✕</Text></Pressable>}
      </View>
      <View style={styles.chipsRow}>
        {chips.map(chip => (
          <Pressable key={chip.key} style={[styles.chip, chip.active && styles.chipActive]} onPress={chip.onPress}>
            <Text style={[styles.chipText, chip.active && styles.chipTextActive]}>{i18n.t(`NETWORK_DIAGNOSTICS.${chip.labelKey}`)}</Text>
            <Text style={styles.chipCount}>{chip.count}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.countLine}>{i18n.t('NETWORK_DIAGNOSTICS.CASES_COUNT').replace('{count}', String(visibleCases.length))}</Text>
    </>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.eyebrow}>{i18n.t('NETWORK_DIAGNOSTICS.EYEBROW')}</Text>
            <Text style={styles.title}>{i18n.t('NETWORK_DIAGNOSTICS.TITLE')}</Text>
          </View>
          <Pressable style={styles.filterBtn} onPress={() => filterRef.current?.present()}>
            <Text style={styles.filterGlyph}>⚙</Text>
            {filterActive && <View style={styles.filterDot} />}
          </Pressable>
        </View>
        <View style={styles.tabs}>
          <Pressable onPress={() => setTab('casos')}>
            <Text style={[styles.tab, tab === 'casos' && styles.tabActive]}>{i18n.t('NETWORK_DIAGNOSTICS.TAB_CASES')}</Text>
          </Pressable>
          <Pressable onPress={() => setTab('resumo')}>
            <Text style={[styles.tab, tab === 'resumo' && styles.tabActive]}>{i18n.t('NETWORK_DIAGNOSTICS.TAB_SUMMARY')}</Text>
          </Pressable>
        </View>
      </View>

      {!!state.error && (
        <Pressable style={styles.errorBar} onPress={nd.refresh}>
          <Text style={styles.errorText}>{i18n.t('NETWORK_DIAGNOSTICS.ERROR_LOAD')} · {i18n.t('NETWORK_DIAGNOSTICS.RETRY')}</Text>
        </Pressable>
      )}

      {tab === 'casos' ? (
        <FlashList
          data={visibleCases}
          keyExtractor={(item) => item.sk}
          estimatedItemSize={140}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <View style={styles.cardWrap}>
              <CaseCard
                item={item}
                busy={updatingSk === item.sk}
                onToggleStatus={() => onToggleStatus(item)}
                onComment={() => openComment(item)}
                onOpen={item.conversation_id ? () => onOpenCase(item) : undefined}
              />
            </View>
          )}
          onEndReachedThreshold={0.5}
          onEndReached={loadMore}
          ListEmptyComponent={!state.loadingList ? (
            <Text style={styles.empty}>{i18n.t('NETWORK_DIAGNOSTICS.EMPTY')}</Text>
          ) : null}
          ListFooterComponent={state.loadingList ? <ActivityIndicator color={colors.brand} style={styles.footer} /> : null}
        />
      ) : (
        <FlashList
          data={[0]}
          keyExtractor={() => 'resumo'}
          renderItem={() => (
            <View>
              <StatCards stats={state.stats} loading={state.loadingStats} />
              <TrendChart stats={state.stats} from={state.from} to={state.to} />
            </View>
          )}
        />
      )}

      <FilterSheet
        ref={filterRef}
        state={state}
        setRange={setRange}
        setFilter={setFilter}
        clearFilters={clearFilters}
        total={state.total}
        onClose={() => filterRef.current?.dismiss()}
      />
      <CommentSheet
        ref={commentRef}
        item={commentCase}
        saving={updatingSk === commentCase?.sk}
        onSave={onSaveComment}
        onClose={() => commentRef.current?.dismiss()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.bg, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  eyebrow: { fontSize: 11, letterSpacing: 1, color: colors.eyebrow, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 3 },
  filterBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  filterGlyph: { color: '#C7D0E0', fontSize: 18 },
  filterDot: { position: 'absolute', top: -3, right: -3, width: 11, height: 11, borderRadius: 999, backgroundColor: colors.brand, borderWidth: 2, borderColor: colors.bg },
  tabs: { flexDirection: 'row', gap: 24, paddingHorizontal: 20 },
  tab: { fontSize: 14.5, fontWeight: '600', paddingVertical: 9, color: '#8A93A8', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { color: colors.text, borderBottomColor: colors.brand },
  errorBar: { backgroundColor: 'rgba(240,82,77,0.14)', paddingVertical: 10, paddingHorizontal: 20 },
  errorText: { color: '#FF7A75', fontSize: 12.5 },
  listContent: { paddingBottom: 32 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingHorizontal: 13, marginHorizontal: 20, marginTop: 14 },
  searchGlyph: { color: '#5C6680', fontSize: 15 },
  searchInput: { flex: 1, color: '#E8ECF4', fontSize: 14.5, paddingVertical: 12 },
  clearGlyph: { color: '#5C6680', fontSize: 16 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20, marginTop: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  chipActive: { backgroundColor: 'rgba(75,141,248,0.18)', borderColor: 'rgba(75,141,248,0.55)' },
  chipText: { fontSize: 12.5, fontWeight: '600', color: '#8A93A8' },
  chipTextActive: { color: '#A8C8FF' },
  chipCount: { fontSize: 11, color: colors.textDim, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 6, paddingHorizontal: 6, overflow: 'hidden' },
  countLine: { fontSize: 13, color: '#8A93A8', paddingHorizontal: 20, marginTop: 8, marginBottom: 4 },
  cardWrap: { paddingHorizontal: 20, paddingTop: 11 },
  empty: { textAlign: 'center', paddingVertical: 48, paddingHorizontal: 20, color: colors.eyebrow, fontSize: 13.5, lineHeight: 22 },
  footer: { paddingVertical: 20 },
});
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no new errors. (If `StackActions.push` typing complains about params, cast the params object `as never` — matches existing `InboxItemContainer` pattern usage.)

- [ ] **Step 3: Commit**

```bash
git add src/screens/settings/backoffice/network-diagnostics/NetworkDiagnosticsScreen.tsx
git commit -m "feat(backoffice): add network diagnostics screen"
```

---

### Task 15: BackofficeScreen (tool menu)

**Files:**
- Create: `src/screens/settings/backoffice/BackofficeScreen.tsx`

**Interfaces:**
- Consumes: `SettingsList` + `SettingsHeader` patterns, `GenericListType`, navigation.
- Produces: default-exported `BackofficeScreen` (light, Settings-styled) navigating to `NetworkDiagnosticsScreen`.

- [ ] **Step 1: Create the screen**

```tsx
// BackofficeScreen.tsx
import React from 'react';
import { StatusBar } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import i18n from 'i18n';
import { tailwind } from '@/theme';
import { SettingsList } from '@/components-next';
import { SwitchIcon } from '@/svg-icons';
import type { GenericListType } from '@/types';

export default function BackofficeScreen(): JSX.Element {
  const navigation = useNavigation();

  const tools: GenericListType[] = [
    {
      hasChevron: true,
      title: i18n.t('BACKOFFICE.NETWORK_DIAGNOSTICS'),
      icon: <SwitchIcon />,
      subtitle: i18n.t('BACKOFFICE.NETWORK_DIAGNOSTICS_DESC'),
      subtitleType: 'light',
      // @ts-expect-error navigation is typed loosely across stacks in this app
      onPressListItem: () => navigation.navigate('NetworkDiagnosticsScreen'),
    },
  ];

  return (
    <SafeAreaView style={tailwind.style('flex-1 bg-white')}>
      <StatusBar translucent backgroundColor={tailwind.color('bg-white')} barStyle="dark-content" />
      <Animated.View style={tailwind.style('px-4 pt-4 pb-2')}>
        <Animated.Text style={tailwind.style('text-[22px] font-inter-580-24 text-gray-950')}>
          {i18n.t('BACKOFFICE.TITLE')}
        </Animated.Text>
      </Animated.View>
      <Animated.ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={tailwind.style('pt-4')}>
          <SettingsList sectionTitle={i18n.t('BACKOFFICE.SUBTITLE')} list={tools} />
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no new errors. (Confirm `GenericListType` and `SettingsList` import paths against `SettingsScreen.tsx`; adjust `font-inter-*` class to one present in the theme if tsc/runtime flags it.)

- [ ] **Step 3: Commit**

```bash
git add src/screens/settings/backoffice/BackofficeScreen.tsx
git commit -m "feat(backoffice): add backoffice tools menu screen"
```

---

### Task 16: Navigation wiring + Settings entry

**Files:**
- Modify: `src/navigation/stack/SettingsStack.tsx`
- Modify: `src/screens/settings/SettingsScreen.tsx`

**Interfaces:**
- Consumes: `BackofficeScreen` (Task 15), `NetworkDiagnosticsScreen` (Task 14).
- Produces: routes `BackofficeScreen` + `NetworkDiagnosticsScreen` in the settings stack; a "Backoffice" row in Settings.

- [ ] **Step 1: Register the routes**

Replace `src/navigation/stack/SettingsStack.tsx` with:

```tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SettingsScreen from '@/screens/settings/SettingsScreen';
import BackofficeScreen from '@/screens/settings/backoffice/BackofficeScreen';
import NetworkDiagnosticsScreen from '@/screens/settings/backoffice/network-diagnostics/NetworkDiagnosticsScreen';

export type SettingsStackParamList = {
  SettingsScreen: undefined;
  BackofficeScreen: undefined;
  NetworkDiagnosticsScreen: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export const SettingsStack = () => {
  return (
    <Stack.Navigator initialRouteName="SettingsScreen" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="BackofficeScreen" component={BackofficeScreen} />
      <Stack.Screen name="NetworkDiagnosticsScreen" component={NetworkDiagnosticsScreen} />
    </Stack.Navigator>
  );
};
```

- [ ] **Step 2: Add the "Backoffice" item to Settings**

In `src/screens/settings/SettingsScreen.tsx`, inside `preferencesList` (after the `SWITCH_ACCOUNT` entry, before the closing `]`), add:

```tsx
    {
      hasChevron: true,
      title: i18n.t('SETTINGS.BACKOFFICE'),
      icon: <SwitchIcon />,
      subtitle: '',
      subtitleType: 'light',
      // @ts-expect-error navigation typed loosely across stacks
      onPressListItem: () => navigation.navigate('BackofficeScreen'),
    },
```

(`SwitchIcon` is already imported in `SettingsScreen.tsx`; `navigation` is already in scope.)

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit -p tsconfig.json && npx eslint src/screens/settings/backoffice src/navigation/stack/SettingsStack.tsx`
Expected: no errors.

- [ ] **Step 4: Run the full test suite**

Run: `npx jest network-diagnostics authSelectors -i`
Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add src/navigation/stack/SettingsStack.tsx src/screens/settings/SettingsScreen.tsx
git commit -m "feat(backoffice): wire backoffice routes and settings entry"
```

---

### Task 17: Manual verification

**Files:** none (verification only).

- [ ] **Step 1: Start the app**

Run: `pnpm start` (then launch iOS/Android per `memory/android-metro-firewall.md` if the emulator can't reach Metro).

- [ ] **Step 2: Verify the flow**

Confirm, signing in as a user whose account has diagnostic cases:
1. Settings shows **Backoffice** → opens the tools menu → **Diagnóstico de rede** opens the dark screen.
2. **Casos** tab: cases load (newest first), chips show counts from stats, search filters loaded names, scrolling loads more pages.
3. `⋯` menu: "Marcar como resolvido" flips the badge + toast; reopen works; "Adicionar comentário" opens the sheet, saving persists + toast; "Abrir caso" opens the conversation (only when `conversation_id` exists).
4. **Resumo** tab: 8 stat cards populate; trend chart renders one bar per day.
5. Filter sheet: period 7/30, status, outcome, connection, transferido, churn toggle all refetch; "Limpar" resets.

- [ ] **Step 3: Verify auth early (highest risk)**

In the network inspector / logs, confirm the webhook call sends `Authorization: Bearer <token>` and returns `success: true` (not `invalid_token`). If `access_token` is absent on the device, re-login to refresh `/profile`; if it persists, surface to the team that the mobile `/profile` payload omits `access_token` (fallback per spec's Risks).

- [ ] **Step 4: Final lint/test gate**

Run: `pnpm test -- network-diagnostics authSelectors && npx tsc --noEmit`
Expected: green. No commit (verification only) unless fixes were needed.

---

## Self-Review

**Spec coverage**

- Navigation entry (Settings → Backoffice → Diagnostics): Tasks 15, 16. ✓
- Auth = Bearer PAT, capture `access_token`: Task 2 (+ used in Tasks 6, 8). ✓
- Webhook host env var: Task 1. ✓
- Types/contract ported: Task 4. ✓
- list/stats/update_status/update_comment client: Task 6. ✓
- Infinite scroll, 7-day default, page_size 25: Tasks 7, 8, 14. ✓
- Filters (outcome/transferido/connection/churn/status) + period: Tasks 7, 12. ✓
- Client-side name search: Tasks 7, 14. ✓
- Tabs Casos/Resumo, chips, case cards, ⋯ menu, toast: Tasks 11, 14. ✓
- 8 stat cards + trend chart (zero-filled by_day): Tasks 5, 9, 10. ✓
- Comment sheet ≤2000 + clear + edit_history: Task 13. ✓
- "Abrir caso" → ChatScreen via conversation_id: Task 14. ✓
- Field mapping (cliente_nome/connection_issue_reason/created_at/outcome/churn): Tasks 5, 11. ✓
- Error handling (success:false strings, session error): Tasks 6, 14. ✓
- i18n keys: Task 3. ✓
- Tests for logic (config, selector, format, client, reducer): Tasks 1, 2, 5, 6, 7. ✓

**Placeholder scan:** No TBD/TODO; every code step shows complete code; UI tasks omit unit tests deliberately (repo has no RTL) and instead end with typecheck — documented in Global Constraints.

**Type consistency:** `caseStatus`, `outcomeLabelKey`, `outcomeTone`, `zeroFillByDay`, `chipCounts`, `searchCases`, `diagnosticsReducer`/`initialState`, client function signatures `(token, accountId, …)`, and hook return shape are used consistently across Tasks 5–16. `FilterKey` values (`outcome`/`transferido`/`connectionIssueObserved`/`churnRisk`/`status`) match the reducer state keys and the `SET_FILTER` usage in Task 14.

**Known follow-ups (not blockers):** bulk multi-select, custom toast styling, and a dedicated Backoffice icon are intentionally out of scope (YAGNI per spec).
