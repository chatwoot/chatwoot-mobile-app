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
