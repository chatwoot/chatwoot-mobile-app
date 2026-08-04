/* eslint-disable import/first -- jest.mock ставим до импортов: шимы нативных модулей должны быть видны глазом раньше кода, который их требует */
/**
 * [conomni] Логика экрана списка чатов (C5): выбор вкладки из параметра роута, тап по
 * строке → навигация, догрузка страниц, ключ пустого состояния. Импортируется из
 * components/ChatListHeader.tsx и components/ChatListRow.tsx, а не из ChatListScreen.tsx —
 * последний тянет `@/hooks` (react-redux) и падает при загрузке в jest этого проекта
 * ("Cannot use import statement outside a module" на ESM-сборке react-redux). Тот же приём
 * см. в src/screens/funnel/specs/FunnelScreen.spec.ts. Тест называется по имени экрана,
 * потому что проверяет логику именно экрана «Список чатов», а не конкретной шапки/строки.
 */
// ChatListHeader.tsx/ChatListRow.tsx рендерят Icon/Avatar (@/components-next/common) →
// барель тянет весь @/utils, включая useAppKeyboardAnimation → react-native-keyboard-controller,
// который без нативной линковки падает в jest (см. ChatListRow.spec.ts).
jest.mock('react-native-keyboard-controller', () => ({ useKeyboardHandler: jest.fn() }));

import { resolveRouteTab, shouldLoadMore, getEmptyStateKey } from '../components/ChatListHeader';
import { handleRowPress } from '../components/ChatListRow';
import { buildCard } from '@/store/chat-list/specs/chatListMockData';

describe('resolveRouteTab', () => {
  it('валидные значения проходят как есть', () => {
    expect(resolveRouteTab('new')).toBe('new');
    expect(resolveRouteTab('mine')).toBe('mine');
    expect(resolveRouteTab('archive')).toBe('archive');
  });

  it('отсутствующий или неизвестный параметр → безопасный дефолт "new"', () => {
    expect(resolveRouteTab(undefined)).toBe('new');
    expect(resolveRouteTab(null)).toBe('new');
    expect(resolveRouteTab('bogus')).toBe('new');
    expect(resolveRouteTab(42)).toBe('new');
  });
});

describe('handleRowPress (тап по строке)', () => {
  it('зовёт навигацию на ChatScreen с conversationId, равным card.id (display_id)', () => {
    const navigate = jest.fn();
    const card = buildCard({ id: 777 });

    handleRowPress(navigate, card);

    expect(navigate).toHaveBeenCalledWith('ChatScreen', { conversationId: 777 });
  });
});

describe('shouldLoadMore', () => {
  it('загружено меньше total и без активной догрузки → грузим ещё', () => {
    expect(shouldLoadMore(25, 60, false)).toBe(true);
  });

  it('уже всё загружено → не грузим', () => {
    expect(shouldLoadMore(60, 60, false)).toBe(false);
  });

  it('идёт догрузка → повторно не запускаем', () => {
    expect(shouldLoadMore(25, 60, true)).toBe(false);
  });
});

describe('getEmptyStateKey', () => {
  it('ключ пустого состояния соответствует вкладке', () => {
    expect(getEmptyStateKey('new')).toBe('CONOMNI.CHAT_LIST.EMPTY_NEW');
    expect(getEmptyStateKey('mine')).toBe('CONOMNI.CHAT_LIST.EMPTY_MINE');
    expect(getEmptyStateKey('archive')).toBe('CONOMNI.CHAT_LIST.EMPTY_ARCHIVE');
  });
});
