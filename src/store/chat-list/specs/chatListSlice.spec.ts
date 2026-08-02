import chatListReducer, { applyRows, ChatListState } from '../chatListSlice';
import { chatListActions } from '../chatListActions';
import { buildCard, buildCounters } from './chatListMockData';

jest.mock('@/i18n', () => ({
  t: (key: string) => key,
}));

jest.mock('@/utils/toastUtils', () => ({
  showToast: jest.fn(),
}));

const emptyState = (overrides: Partial<ChatListState> = {}): ChatListState => ({
  cards: { new: [], mine: [], archive: [] },
  total: { new: 0, mine: 0, archive: 0 },
  page: { new: 0, mine: 0, archive: 0 },
  isLoading: false,
  isLoadingMore: false,
  badgeCounters: { new: 0, mine: 0 },
  ...overrides,
});

describe('chatListSlice: applyRows', () => {
  it('оставляет строку с tab:"bot" во вкладке "new" (include_bot не повод её убирать)', () => {
    const state = emptyState({
      cards: { new: [buildCard({ id: 1, tab: 'new' })], mine: [], archive: [] },
    });
    const row = buildCard({ id: 1, tab: 'bot', status: 'pending' });

    const next = chatListReducer(state, applyRows({ tab: 'new', requestedIds: [1], rows: [row] }));

    expect(next.cards.new).toHaveLength(1);
    expect(next.cards.new[0]).toEqual(row);
  });

  it('убирает из "new" строку, вернувшуюся с tab:"archive"', () => {
    const state = emptyState({
      cards: { new: [buildCard({ id: 1, tab: 'new' })], mine: [], archive: [] },
    });
    const row = buildCard({ id: 1, tab: 'archive', status: 'resolved' });

    const next = chatListReducer(state, applyRows({ tab: 'new', requestedIds: [1], rows: [row] }));

    expect(next.cards.new).toHaveLength(0);
  });

  it('не удаляет строки, чьих id не было в requestedIds', () => {
    const untouched = buildCard({ id: 2, tab: 'new' });
    const state = emptyState({
      cards: { new: [buildCard({ id: 1, tab: 'new' }), untouched], mine: [], archive: [] },
    });
    // Спросили только про id 1, и он "пропал" (не вернулся в rows) — id 2 трогать нельзя.
    const next = chatListReducer(state, applyRows({ tab: 'new', requestedIds: [1], rows: [] }));

    expect(next.cards.new).toEqual([untouched]);
  });

  it('добавляет новую подходящую строку, которой раньше не было в списке', () => {
    const state = emptyState({ cards: { new: [], mine: [], archive: [] } });
    const row = buildCard({ id: 5, tab: 'new' });

    const next = chatListReducer(state, applyRows({ tab: 'new', requestedIds: [5], rows: [row] }));

    expect(next.cards.new).toEqual([row]);
  });
});

describe('chatListSlice: fetchChatList', () => {
  it('page=1 заменяет список, isLoading переключается', () => {
    const loadingState = chatListReducer(
      emptyState(),
      chatListActions.fetchChatList.pending('req', { tab: 'new', page: 1, userId: 1 }),
    );
    expect(loadingState.isLoading).toBe(true);
    expect(loadingState.isLoadingMore).toBe(false);

    const cards = [buildCard({ id: 1 }), buildCard({ id: 2 })];
    const counters = buildCounters({ new: 2 });
    const next = chatListReducer(
      loadingState,
      chatListActions.fetchChatList.fulfilled(
        { tab: 'new', page: 1, cards, total: 2, counters },
        'req',
        { tab: 'new', page: 1, userId: 1 },
      ),
    );

    expect(next.cards.new).toEqual(cards);
    expect(next.total.new).toBe(2);
    expect(next.page.new).toBe(1);
    expect(next.isLoading).toBe(false);
  });

  it('page>1 складывает карточки, не затирая и не дублируя, isLoadingMore переключается', () => {
    const state = emptyState({
      cards: { new: [buildCard({ id: 1 })], mine: [], archive: [] },
      total: { new: 1, mine: 0, archive: 0 },
      page: { new: 1, mine: 0, archive: 0 },
    });

    const loadingMore = chatListReducer(
      state,
      chatListActions.fetchChatList.pending('req', { tab: 'new', page: 2, userId: 1 }),
    );
    expect(loadingMore.isLoadingMore).toBe(true);

    // Вторая страница: одна новая карточка (id:2) + переприслали id:1 (не должно задвоиться)
    const cardsPage2 = [buildCard({ id: 1, price: 500 }), buildCard({ id: 2 })];
    const counters = buildCounters({ new: 2 });
    const next = chatListReducer(
      loadingMore,
      chatListActions.fetchChatList.fulfilled(
        { tab: 'new', page: 2, cards: cardsPage2, total: 2, counters },
        'req',
        { tab: 'new', page: 2, userId: 1 },
      ),
    );

    expect(next.cards.new.map(c => c.id)).toEqual([1, 2]);
    expect(next.cards.new[0].price).toBe(500); // обновилась, а не задвоилась
    expect(next.page.new).toBe(2);
    expect(next.isLoadingMore).toBe(false);
  });

  it('вкладка "mine": badgeCounters.mine берётся из counters.accepted ответа', () => {
    const counters = buildCounters({ accepted: 7 });
    const next = chatListReducer(
      emptyState(),
      chatListActions.fetchChatList.fulfilled(
        { tab: 'mine', page: 1, cards: [], total: 0, counters },
        'req',
        { tab: 'mine', page: 1, userId: 1 },
      ),
    );
    expect(next.badgeCounters.mine).toBe(7);
  });
});

describe('chatListSlice: fetchBadgeCounters', () => {
  it('badgeCounters.new берётся из counters.new ответа', () => {
    const counters = buildCounters({ new: 4 });
    const next = chatListReducer(
      emptyState(),
      chatListActions.fetchBadgeCounters.fulfilled({ counters }, 'req', undefined),
    );
    expect(next.badgeCounters.new).toBe(4);
  });
});
