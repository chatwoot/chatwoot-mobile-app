// [conomni] задача C7: рендер-тестов компонентов в проекте нет (нет @testing-library) —
// тестируем resolveStageDisplay, чистую функцию, которая решает, что именно должна
// показать шапка (название+цвет этапа либо нейтральное «Без этапа»). Сам ChatHeader —
// тонкая обёртка над ней, как ChannelBrandMark.tsx над resolveChannelBrandMark.
import { resolveStageDisplay } from '../ChatHeader';
import i18n from '@/i18n';
import type { FunnelStage } from '@/store/funnel/funnelTypes';

const stage: FunnelStage = {
  id: 3,
  name: 'Переговоры',
  color: '#FF00AA',
  position: 1,
  kind: 'normal',
  conversations_count: 0,
};

describe('resolveStageDisplay', () => {
  it('с этапом — название и цвет ровно из stage.color', () => {
    expect(resolveStageDisplay(stage)).toEqual({
      label: 'Переговоры',
      color: '#FF00AA',
      isNone: false,
    });
  });

  it('без этапа (undefined) — «Без этапа», без цвета (нейтральный в разметке)', () => {
    expect(resolveStageDisplay(undefined)).toEqual({
      label: i18n.t('CONOMNI.STAGE.NONE'),
      color: null,
      isNone: true,
    });
  });

  it('без этапа (null) — тоже «Без этапа», экран не падает ни при каких данных', () => {
    expect(() => resolveStageDisplay(null)).not.toThrow();
    expect(resolveStageDisplay(null)).toEqual({
      label: i18n.t('CONOMNI.STAGE.NONE'),
      color: null,
      isNone: true,
    });
  });
});
