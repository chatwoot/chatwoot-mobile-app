import { FunnelService } from '../funnelService';
import { apiService } from '@/services/APIService';

jest.mock('@/services/APIService', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  },
}));

const patchApiService = apiService as unknown as { patch: jest.Mock };

describe('FunnelService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchStages', () => {
    it('делает GET на conomni/funnel/stages и возвращает payload', async () => {
      const stages = [
        {
          id: 1,
          name: 'Новый',
          color: '#000',
          position: 0,
          kind: 'normal',
          conversations_count: 2,
        },
      ];
      (apiService.get as jest.Mock).mockResolvedValueOnce({ data: { payload: stages } });

      const result = await FunnelService.fetchStages();

      expect(apiService.get).toHaveBeenCalledWith('conomni/funnel/stages');
      expect(result).toEqual(stages);
    });
  });

  describe('fetchStageColumn', () => {
    it('кладёт id этапа В ПУТЬ запроса, а не в query', async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce({
        data: { payload: { total: 0, cards: [] } },
      });

      await FunnelService.fetchStageColumn({ stageId: 7, page: 2 });

      expect(apiService.get).toHaveBeenCalledWith('conomni/funnel/board/7', {
        params: { page: 2 },
      });
    });

    it('запрашивает колонку unassigned тем же способом (id в пути)', async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce({
        data: { payload: { total: 0, cards: [] } },
      });

      await FunnelService.fetchStageColumn({ stageId: 'unassigned', page: 1 });

      expect(apiService.get).toHaveBeenCalledWith('conomni/funnel/board/unassigned', {
        params: { page: 1 },
      });
    });

    it('возвращает stageId/page вместе с total и cards', async () => {
      const cards = [{ id: 1 }];
      (apiService.get as jest.Mock).mockResolvedValueOnce({
        data: { payload: { total: 5, cards } },
      });

      const result = await FunnelService.fetchStageColumn({ stageId: 3, page: 1 });

      expect(result).toEqual({ stageId: 3, page: 1, total: 5, cards });
    });
  });

  describe('updateConversationFunnel', () => {
    it('шлёт PATCH на conomni/funnel/conversations/{conversationId}', async () => {
      const card = { id: 4 };
      patchApiService.patch.mockResolvedValueOnce({ data: { payload: card } });

      const result = await FunnelService.updateConversationFunnel({
        conversationId: 4,
        stageId: 9,
        price: 1000,
      });

      expect(patchApiService.patch).toHaveBeenCalledWith('conomni/funnel/conversations/4', {
        stage_id: 9,
        price: 1000,
      });
      expect(result).toEqual(card);
    });

    it('с одной только ценой не включает ключ stage_id в тело', async () => {
      patchApiService.patch.mockResolvedValueOnce({ data: { payload: { id: 1 } } });

      await FunnelService.updateConversationFunnel({ conversationId: 1, price: 500 });

      expect(patchApiService.patch).toHaveBeenCalledWith('conomni/funnel/conversations/1', {
        price: 500,
      });
    });

    it('пустая цена уезжает как price: "" (осмысленная команда стереть)', async () => {
      patchApiService.patch.mockResolvedValueOnce({ data: { payload: { id: 1 } } });

      await FunnelService.updateConversationFunnel({ conversationId: 1, price: '' });

      expect(patchApiService.patch).toHaveBeenCalledWith('conomni/funnel/conversations/1', {
        price: '',
      });
    });

    it('явный stageId: null уезжает как stage_id: null (снять этап)', async () => {
      patchApiService.patch.mockResolvedValueOnce({ data: { payload: { id: 1 } } });

      await FunnelService.updateConversationFunnel({ conversationId: 1, stageId: null });

      expect(patchApiService.patch).toHaveBeenCalledWith('conomni/funnel/conversations/1', {
        stage_id: null,
      });
    });

    it('без stageId и price шлёт пустое тело', async () => {
      patchApiService.patch.mockResolvedValueOnce({ data: { payload: { id: 1 } } });

      await FunnelService.updateConversationFunnel({ conversationId: 1 });

      expect(patchApiService.patch).toHaveBeenCalledWith('conomni/funnel/conversations/1', {});
    });
  });
});
