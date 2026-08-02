import {
  selectStages,
  selectStageById,
  selectStageCards,
  selectStageTotal,
  selectIsLoadingStages,
  selectIsLoadingColumn,
  selectIsUpdating,
} from '../funnelSelectors';
import type { FunnelState } from '../funnelSlice';
import type { FunnelCard, FunnelStage } from '../funnelTypes';

const stage = (overrides: Partial<FunnelStage> = {}): FunnelStage => ({
  id: 7,
  name: 'Переговоры',
  color: '#12A594',
  position: 2,
  kind: 'normal',
  conversations_count: 3,
  ...overrides,
});

const card = (overrides: Partial<FunnelCard> = {}): FunnelCard => ({
  id: 1,
  display_id: 1,
  status: 'open',
  stage_id: 7,
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

describe('funnelSelectors', () => {
  const funnelState: FunnelState = {
    stages: [stage({ id: 7 })],
    cards: { '7': [card({ id: 1 })], unassigned: [card({ id: 2, stage_id: null })] },
    total: { '7': 10 },
    page: { '7': 1 },
    isLoadingStages: true,
    isLoadingColumn: false,
    isUpdating: true,
  };
  // Селекторы читают state.funnel — тестируем через объект с этим ключом (RootState
  // получит его от реального стора, когда оркестратор зарегистрирует редьюсер).
  const rootState = { funnel: funnelState } as unknown as Parameters<typeof selectStages>[0];

  it('selectStages отдаёт список этапов как есть (сортировку уже сделал редьюсер)', () => {
    expect(selectStages(rootState)).toEqual(funnelState.stages);
  });

  it('selectStageById находит этап по числовому id', () => {
    expect(selectStageById(rootState, 7)).toEqual(stage({ id: 7 }));
  });

  it('selectStageById находит этап по строковому id (jsonb может отдать строку)', () => {
    expect(selectStageById(rootState, '7')).toEqual(stage({ id: 7 }));
  });

  it('selectStageById возвращает undefined для несуществующего этапа', () => {
    expect(selectStageById(rootState, 999)).toBeUndefined();
  });

  it('selectStageCards отдаёт карточки этапа по ключу', () => {
    expect(selectStageCards(rootState, 7)).toEqual(funnelState.cards['7']);
  });

  it('selectStageCards отдаёт карточки колонки unassigned', () => {
    expect(selectStageCards(rootState, 'unassigned')).toEqual(funnelState.cards.unassigned);
  });

  it('selectStageCards отдаёт пустой массив для незагруженной колонки', () => {
    expect(selectStageCards(rootState, 42)).toEqual([]);
  });

  it('selectStageTotal отдаёт total этапа, 0 для незагруженного', () => {
    expect(selectStageTotal(rootState, 7)).toBe(10);
    expect(selectStageTotal(rootState, 42)).toBe(0);
  });

  it('флаги загрузки читаются напрямую из состояния', () => {
    expect(selectIsLoadingStages(rootState)).toBe(true);
    expect(selectIsLoadingColumn(rootState)).toBe(false);
    expect(selectIsUpdating(rootState)).toBe(true);
  });
});
