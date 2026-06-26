// data/reducer.ts
import { isoDate } from './format';
import type {
  BoolFilter,
  NetworkCase,
  NetworkCasesListResponse,
  NetworkOutcome,
  NetworkStats,
  StatusFilter,
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
  reconcileNonce: number;
}

export type FilterKey =
  | 'outcome'
  | 'transferido'
  | 'connectionIssueObserved'
  | 'churnRisk'
  | 'status';

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
  | { type: 'PATCH_CASE'; item: NetworkCase }
  | { type: 'RECONCILE' };

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
    reconcileNonce: 0,
  };
}

export function diagnosticsReducer(
  state: DiagnosticsState,
  action: DiagnosticsAction,
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
        outcome: '',
        transferido: '',
        connectionIssueObserved: '',
        churnRisk: '',
        status: '',
        page: 1,
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
        items: action.append ? [...state.items, ...action.response.items] : action.response.items,
      };
    case 'LIST_ERROR':
      return { ...state, loadingList: false, error: action.error };
    case 'STATS_LOADING':
      return { ...state, loadingStats: true, error: null };
    case 'STATS_SUCCESS':
      return { ...state, loadingStats: false, stats: action.stats };
    case 'STATS_ERROR':
      return { ...state, loadingStats: false, error: action.error };
    case 'PATCH_CASE':
      return {
        ...state,
        items: state.items.map(i => (i.sk === action.item.sk ? action.item : i)),
      };
    case 'RECONCILE':
      return { ...state, reconcileNonce: state.reconcileNonce + 1 };
    default:
      return state;
  }
}

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/gu, '').toLowerCase();
}

/** Client-side name search over already-loaded items (API has no name param). */
export function searchCases(items: NetworkCase[], query: string): NetworkCase[] {
  const q = normalize(query.trim());
  if (!q) return items;
  return items.filter(i => normalize(i.cliente_nome || '').includes(q));
}

export function chipCounts(stats: NetworkStats | null): {
  all: number;
  pending: number;
  risk: number;
  resolved: number;
} {
  return {
    all: stats?.total ?? 0,
    pending: stats?.pendentes ?? 0,
    risk: stats?.churn_risk ?? 0,
    resolved: stats?.resolvidos ?? 0,
  };
}
