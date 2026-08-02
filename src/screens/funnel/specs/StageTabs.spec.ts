import { buildFunnelTabs, activeTabColor, UNASSIGNED_STAGE_ID } from '../components/StageTabs';
import type { FunnelStage } from '@/store/funnel/funnelTypes';

const stage = (overrides: Partial<FunnelStage> = {}): FunnelStage => ({
  id: 1,
  name: 'Новый',
  color: '#12A594',
  position: 0,
  kind: 'normal',
  conversations_count: 0,
  ...overrides,
});

describe('buildFunnelTabs', () => {
  it('идут в порядке position, «Непринятые» — последней вкладкой', () => {
    const stages = [
      stage({ id: 3, name: 'Победа', position: 20 }),
      stage({ id: 1, name: 'Новый', position: 0 }),
      stage({ id: 2, name: 'В работе', position: 10 }),
    ];

    const tabs = buildFunnelTabs(stages);

    expect(tabs.map(t => t.id)).toEqual([1, 2, 3, UNASSIGNED_STAGE_ID]);
    expect(tabs[tabs.length - 1].id).toBe('unassigned');
  });

  it('не мутирует переданный массив этапов', () => {
    const stages = [stage({ id: 2, position: 5 }), stage({ id: 1, position: 1 })];
    const original = [...stages];

    buildFunnelTabs(stages);

    expect(stages).toEqual(original);
  });

  it('«Непринятые» — последняя вкладка даже без единого реального этапа', () => {
    const tabs = buildFunnelTabs([]);
    expect(tabs).toHaveLength(1);
    expect(tabs[0].id).toBe(UNASSIGNED_STAGE_ID);
  });
});

describe('activeTabColor', () => {
  it('для этапа возвращает stage.color', () => {
    const tab = { id: 1, name: 'Новый', color: '#12A594' };
    expect(activeTabColor(tab)).toBe('#12A594');
  });

  it('для «Непринятые» (color: null) возвращает null — нейтральный цвет ставит компонент', () => {
    const tab = { id: UNASSIGNED_STAGE_ID, name: 'Непринятые', color: null };
    expect(activeTabColor(tab)).toBeNull();
  });
});
