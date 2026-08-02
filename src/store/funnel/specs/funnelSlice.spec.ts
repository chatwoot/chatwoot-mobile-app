import funnelReducer, { FunnelState } from '../funnelSlice';
import { funnelActions } from '../funnelActions';
import type { FunnelCard, FunnelStage } from '../funnelTypes';

const stage = (overrides: Partial<FunnelStage> = {}): FunnelStage => ({
  id: 1,
  name: 'Новый',
  color: '#000000',
  position: 0,
  kind: 'normal',
  conversations_count: 0,
  ...overrides,
});

const card = (overrides: Partial<FunnelCard> = {}): FunnelCard => ({
  id: 1,
  display_id: 1,
  status: 'open',
  stage_id: 1,
  price: null,
  labels: [],
  last_activity_at: null,
  urgency: { level: 'none', next_level_at: null },
  last_message: 'привет',
  contact: { id: 1, name: 'Клиент', thumbnail: '' },
  inbox: { id: 1, name: 'VK', channel_type: 'Channel::Api', conomni_channel: 'vk' },
  assignee: null,
  ...overrides,
});

const initialState: FunnelState = {
  stages: [],
  cards: {},
  total: {},
  page: {},
  isLoadingStages: false,
  isLoadingColumn: false,
  isUpdating: false,
};

describe('funnelSlice', () => {
  it('возвращает начальное состояние', () => {
    expect(funnelReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('fetchStages', () => {
    it('ставит флаг загрузки на pending', () => {
      const state = funnelReducer(initialState, { type: funnelActions.fetchStages.pending.type });
      expect(state.isLoadingStages).toBe(true);
    });

    it('сохраняет этапы, отсортированными по position', () => {
      const stages = [stage({ id: 2, position: 5 }), stage({ id: 1, position: 1 })];
      const action = { type: funnelActions.fetchStages.fulfilled.type, payload: stages };
      const state = funnelReducer(initialState, action);

      expect(state.isLoadingStages).toBe(false);
      expect(state.stages.map(s => s.id)).toEqual([1, 2]);
    });

    it('снимает флаг загрузки на rejected', () => {
      const withLoading = { ...initialState, isLoadingStages: true };
      const state = funnelReducer(withLoading, { type: funnelActions.fetchStages.rejected.type });
      expect(state.isLoadingStages).toBe(false);
    });
  });

  describe('fetchStageColumn', () => {
    it('page=1 заменяет карточки колонки', () => {
      const withExisting: FunnelState = {
        ...initialState,
        cards: { '1': [card({ id: 99 })] },
      };
      const action = {
        type: funnelActions.fetchStageColumn.fulfilled.type,
        payload: { stageId: 1, page: 1, total: 1, cards: [card({ id: 1 })] },
      };
      const state = funnelReducer(withExisting, action);

      expect(state.cards['1'].map(c => c.id)).toEqual([1]);
      expect(state.total['1']).toBe(1);
      expect(state.page['1']).toBe(1);
    });

    it('догрузка (page>1) складывает карточки без дублей по id', () => {
      const withPage1: FunnelState = {
        ...initialState,
        cards: { '1': [card({ id: 1 }), card({ id: 2 })] },
      };
      const action = {
        type: funnelActions.fetchStageColumn.fulfilled.type,
        payload: { stageId: 1, page: 2, total: 3, cards: [card({ id: 2 }), card({ id: 3 })] },
      };
      const state = funnelReducer(withPage1, action);

      expect(state.cards['1'].map(c => c.id)).toEqual([1, 2, 3]);
      expect(state.page['1']).toBe(2);
    });

    it('колонка unassigned хранится под ключом "unassigned"', () => {
      const action = {
        type: funnelActions.fetchStageColumn.fulfilled.type,
        payload: {
          stageId: 'unassigned',
          page: 1,
          total: 1,
          cards: [card({ id: 5, stage_id: null })],
        },
      };
      const state = funnelReducer(initialState, action);

      expect(state.cards['unassigned'].map(c => c.id)).toEqual([5]);
    });
  });

  describe('updateConversationFunnel', () => {
    it('обновляет карточку по id, если этап не изменился', () => {
      const withCard: FunnelState = {
        ...initialState,
        cards: { '1': [card({ id: 1, price: null })] },
      };
      const action = {
        type: funnelActions.updateConversationFunnel.fulfilled.type,
        payload: card({ id: 1, stage_id: 1, price: 5000 }),
      };
      const state = funnelReducer(withCard, action);

      expect(state.cards['1']).toHaveLength(1);
      expect(state.cards['1'][0].price).toBe(5000);
    });

    it('убирает карточку из колонки прежнего этапа, если этап сменился', () => {
      const withCard: FunnelState = {
        ...initialState,
        cards: { '1': [card({ id: 1, stage_id: 1 })] },
        total: { '1': 1 },
      };
      const action = {
        type: funnelActions.updateConversationFunnel.fulfilled.type,
        payload: card({ id: 1, stage_id: 2 }),
      };
      const state = funnelReducer(withCard, action);

      // карточка ушла из старой колонки...
      expect(state.cards['1']).toHaveLength(0);
      // ...и НЕ дописана вручную в новую (её место подгрузится при открытии колонки 2)
      expect(state.cards['2']).toBeUndefined();
    });

    it('не трогает колонки, где такой карточки не было', () => {
      const withCards: FunnelState = {
        ...initialState,
        cards: {
          '1': [card({ id: 1, stage_id: 1 })],
          '2': [card({ id: 2, stage_id: 2 })],
        },
      };
      const action = {
        type: funnelActions.updateConversationFunnel.fulfilled.type,
        payload: card({ id: 1, stage_id: 3 }),
      };
      const state = funnelReducer(withCards, action);

      expect(state.cards['2']).toHaveLength(1);
      expect(state.cards['2'][0].id).toBe(2);
    });
  });
});
