import { buildChatListParams, chatListActions } from '../chatListActions';
import { ChatListService } from '../chatListService';
import { buildCard, buildCounters } from './chatListMockData';

jest.mock('@/i18n', () => ({
  t: (key: string) => key,
}));

jest.mock('@/utils/toastUtils', () => ({
  showToast: jest.fn(),
}));

jest.mock('../chatListService', () => ({
  ChatListService: {
    fetchChatList: jest.fn(),
    fetchRows: jest.fn(),
  },
}));

describe('buildChatListParams', () => {
  it('строит параметры вкладки "new": include_bot, сортировка по ожиданию, по возрастанию', () => {
    const params = buildChatListParams('new', { userId: 5, page: 1 });
    expect(params).toEqual({
      tab: 'new',
      include_bot: 1,
      sort: 'waiting',
      direction: 'asc',
      page: 1,
    });
  });

  it('строит параметры вкладки "mine": серверный tab=accepted + assignee_id[]=userId', () => {
    const params = buildChatListParams('mine', { userId: 42, page: 2 });
    expect(params).toEqual({
      tab: 'accepted',
      'assignee_id[]': [42],
      sort: 'waiting',
      direction: 'asc',
      page: 2,
    });
  });

  it('строит параметры вкладки "archive": сортировка по активности, по убыванию', () => {
    const params = buildChatListParams('archive', { userId: 5, page: 1 });
    expect(params).toEqual({
      tab: 'archive',
      sort: 'activity',
      direction: 'desc',
      page: 1,
    });
  });

  it('не добавляет пустые фильтры в параметры', () => {
    const params = buildChatListParams('new', { userId: 5, page: 1, filters: {} });
    expect(params).not.toHaveProperty('inbox_id[]');
    expect(params).not.toHaveProperty('since');
    expect(params).not.toHaveProperty('until');
  });

  it('добавляет непустые фильтры inbox_id[]/since/until в параметры', () => {
    const params = buildChatListParams('archive', {
      userId: 5,
      page: 1,
      filters: { inboxIds: [3, 4], since: 1700000000, until: 1700100000 },
    });
    expect(params).toMatchObject({
      'inbox_id[]': [3, 4],
      since: 1700000000,
      until: 1700100000,
    });
  });

  it('не добавляет inbox_id[] для пустого массива фильтра', () => {
    const params = buildChatListParams('new', { userId: 5, page: 1, filters: { inboxIds: [] } });
    expect(params).not.toHaveProperty('inbox_id[]');
  });
});

describe('chatListActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchChatList', () => {
    it('зовёт ChatListService.fetchChatList с параметрами вкладки и отдаёт tab/page в результате', async () => {
      const cards = [buildCard({ id: 1 })];
      const counters = buildCounters({ new: 1 });
      (ChatListService.fetchChatList as jest.Mock).mockResolvedValue({
        cards,
        total: 1,
        counters,
        bot_inbox_ids: [7],
      });

      const dispatch = jest.fn();
      const getState = jest.fn();
      const result = await chatListActions.fetchChatList({
        tab: 'new',
        page: 1,
        userId: 5,
      })(dispatch, getState, undefined);

      expect(ChatListService.fetchChatList).toHaveBeenCalledWith({
        tab: 'new',
        include_bot: 1,
        sort: 'waiting',
        direction: 'asc',
        page: 1,
      });
      expect(result.payload).toEqual({
        tab: 'new',
        page: 1,
        cards,
        total: 1,
        counters,
      });
    });
  });

  describe('fetchRows', () => {
    it('зовёт ChatListService.fetchRows и прокидывает requestedIds в результат', async () => {
      const rows = [buildCard({ id: 9 })];
      const counters = buildCounters();
      (ChatListService.fetchRows as jest.Mock).mockResolvedValue({ rows, counters });

      const dispatch = jest.fn();
      const getState = jest.fn();
      const result = await chatListActions.fetchRows({ tab: 'new', ids: [9, 10] })(
        dispatch,
        getState,
        undefined,
      );

      expect(ChatListService.fetchRows).toHaveBeenCalledWith([9, 10]);
      expect(result.payload).toEqual({
        tab: 'new',
        requestedIds: [9, 10],
        rows,
        counters,
      });
    });
  });

  describe('fetchBadgeCounters', () => {
    it('шлёт запрос без фильтра ответственного (без assignee_id[])', async () => {
      const counters = buildCounters({ new: 3 });
      (ChatListService.fetchChatList as jest.Mock).mockResolvedValue({
        cards: [],
        total: 3,
        counters,
        bot_inbox_ids: [],
      });

      const dispatch = jest.fn();
      const getState = jest.fn();
      const result = await chatListActions.fetchBadgeCounters()(dispatch, getState, undefined);

      const calledWith = (ChatListService.fetchChatList as jest.Mock).mock.calls[0][0];
      expect(calledWith).not.toHaveProperty('assignee_id[]');
      expect(calledWith).toMatchObject({ tab: 'new', include_bot: 1, page: 1 });
      expect(result.payload).toEqual({ counters });
    });
  });
});
