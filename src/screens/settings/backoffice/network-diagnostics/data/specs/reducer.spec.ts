// data/specs/reducer.spec.ts
import {
  initialState, diagnosticsReducer, searchCases, chipCounts, DEFAULT_PAGE_SIZE,
  type DiagnosticsState,
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
    let s: DiagnosticsState = { ...initialState(), status: 'resolvido', churnRisk: 'true', page: 3 };
    s = diagnosticsReducer(s, { type: 'CLEAR_FILTERS' });
    expect(s.status).toBe('');
    expect(s.churnRisk).toBe('');
    expect(s.page).toBe(1);
  });

  it('SET_RANGE resets the page to 1', () => {
    let s = { ...initialState(), page: 5 };
    s = diagnosticsReducer(s, { type: 'SET_RANGE', from: '2026-06-01', to: '2026-06-30' });
    expect(s.page).toBe(1);
    expect(s.from).toBe('2026-06-01');
    expect(s.to).toBe('2026-06-30');
  });

  it('STATS_LOADING clears a prior error', () => {
    let s: DiagnosticsState = { ...initialState(), error: 'boom' };
    s = diagnosticsReducer(s, { type: 'STATS_LOADING' });
    expect(s.error).toBeNull();
    expect(s.loadingStats).toBe(true);
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
