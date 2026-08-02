import { ChatListService } from '../chatListService';
import { apiService } from '@/services/APIService';
import { buildCard, buildCounters } from './chatListMockData';

jest.mock('@/i18n', () => ({
  t: (key: string) => key,
}));

jest.mock('@/utils/toastUtils', () => ({
  showToast: jest.fn(),
}));

jest.mock('@/services/APIService', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('ChatListService', () => {
  it('fetchChatList зовёт GET conomni/chat_list с переданными параметрами и отдаёт payload', async () => {
    const cards = [buildCard()];
    const counters = buildCounters();
    (apiService.get as jest.Mock).mockResolvedValueOnce({
      data: { payload: { cards, total: 1, counters, bot_inbox_ids: [1] } },
    });

    const params = { tab: 'new' as const, page: 1, include_bot: 1 as const };
    const result = await ChatListService.fetchChatList(params);

    expect(apiService.get).toHaveBeenCalledWith('conomni/chat_list', { params });
    expect(result).toEqual({ cards, total: 1, counters, bot_inbox_ids: [1] });
  });

  it('fetchRows зовёт POST conomni/chat_list/rows с телом {ids} и отдаёт payload', async () => {
    const rows = [buildCard({ id: 2 })];
    const counters = buildCounters();
    (apiService.post as jest.Mock).mockResolvedValueOnce({
      data: { payload: { rows, counters } },
    });

    const result = await ChatListService.fetchRows([2, 3]);

    expect(apiService.post).toHaveBeenCalledWith('conomni/chat_list/rows', { ids: [2, 3] });
    expect(result).toEqual({ rows, counters });
  });
});
