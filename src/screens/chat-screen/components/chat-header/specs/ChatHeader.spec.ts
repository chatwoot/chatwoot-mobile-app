/* eslint-disable import/first -- jest.mock ставим до импортов: шимы нативных модулей должны быть видны глазом раньше кода, который их требует */
// [conomni] задача C7: рендер-тестов компонентов в проекте нет (нет @testing-library) —
// тестируем resolveStageDisplay, чистую функцию, которая решает, что именно должна
// показать шапка (название+цвет этапа либо нейтральное «Без этапа»). Сам ChatHeader —
// тонкая обёртка над ней, как ChannelBrandMark.tsx над resolveChannelBrandMark.
// ChatHeader.tsx рендерит Icon/Avatar (@/components-next) → барель index.ts реэкспортит
// ВСЕ подпапки next-компонентов, включая чужие (LabelActions → @/hooks → react-redux,
// AttributeList → @react-native-clipboard/clipboard) — без линковки/ESM-транспиляции они
// падают при простом require в jest. Три моки ниже — починка окружения теста (компонент
// не рендерится, реальные хуки/нативный модуль не вызываются), тот же приём, что
// ChatListRow.spec.ts применяет к keyboard-controller.
// DropdownMenu.tsx (соседний файл, импортируется ChatHeader.tsx) тянет `zeego/dropdown-menu`
// — чистый ESM-пакет, jest его не транспилирует (не входит в default transformIgnorePatterns).
// `DropdownMenu.create(...)` вызывается на уровне модуля дважды — мок должен быть вызываемым.
jest.mock('react-native-keyboard-controller', () => ({ useKeyboardHandler: jest.fn() }));
jest.mock('react-redux', () => ({ useDispatch: jest.fn(), useSelector: jest.fn() }));
jest.mock('@react-native-clipboard/clipboard', () => ({
  getString: jest.fn(),
  setString: jest.fn(),
}));
jest.mock('zeego/dropdown-menu', () => ({
  create: (component: unknown) => component,
  Root: 'View',
  Trigger: 'View',
  Content: 'View',
  Item: 'View',
  ItemTitle: 'Text',
}));

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
