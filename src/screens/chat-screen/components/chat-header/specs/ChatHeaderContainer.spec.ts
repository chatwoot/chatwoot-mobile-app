/* eslint-disable import/first -- jest.mock ставим до импортов: шимы нативных модулей должны быть видны глазом раньше кода, который их требует */
// [conomni] задача C7: чистые функции контейнера шапки чата, вынесенные ради тестируемости
// (нет @testing-library в проекте — сам контейнер не рендерится).
// ChatHeaderContainer.tsx тянет @/hooks → react-redux (ESM-сборка `react-native` условия
// пакета парсится как модуль, jest падает на "Cannot use import statement outside a
// module") и, транзитивно через ChatHeader.tsx → @/components-next, react-native-keyboard-
// controller (падает без нативной линковки, тот же приём, что ChatListRow.spec.ts). Оба —
// починка окружения теста, реальные хуки в тесте не вызываются (компонент не рендерится).
jest.mock('react-redux', () => ({ useDispatch: jest.fn(), useSelector: jest.fn() }));
jest.mock('react-native-keyboard-controller', () => ({ useKeyboardHandler: jest.fn() }));
jest.mock('@react-native-clipboard/clipboard', () => ({
  getString: jest.fn(),
  setString: jest.fn(),
}));
// DropdownMenu.tsx (соседний файл, импортируется ChatHeader.tsx) тянет `zeego/dropdown-menu`
// — чистый ESM-пакет, jest его не транспилирует (не входит в default transformIgnorePatterns).
jest.mock('zeego/dropdown-menu', () => ({
  create: (component: unknown) => component,
  Root: 'View',
  Trigger: 'View',
  Content: 'View',
  Item: 'View',
  ItemTitle: 'Text',
}));

import { resolveConversationStageId, openStageSheet } from '../ChatHeaderContainer';
import { selectSingleConversation } from '@/store/conversation/conversationSelectedSlice';
import { setActionState } from '@/store/conversation/conversationActionSlice';
import type { Conversation } from '@/types';

describe('resolveConversationStageId', () => {
  it('берёт conomni_stage_id из custom_attributes диалога', () => {
    const conversation = {
      customAttributes: { conomni_stage_id: '5' },
    } as unknown as Conversation;

    expect(resolveConversationStageId(conversation)).toBe('5');
  });

  it('диалог ещё не загружен — null, не падает', () => {
    expect(resolveConversationStageId(undefined)).toBeNull();
  });

  it('нет ключа в custom_attributes — null (этапа нет, это не ошибка)', () => {
    const conversation = { customAttributes: {} } as unknown as Conversation;
    expect(resolveConversationStageId(conversation)).toBeNull();
  });

  it('пустая строка трактуется как «этапа нет»', () => {
    const conversation = {
      customAttributes: { conomni_stage_id: '' },
    } as unknown as Conversation;

    expect(resolveConversationStageId(conversation)).toBeNull();
  });
});

describe('openStageSheet', () => {
  it('выбирает диалог, включает состояние Stage и открывает общую шторку действий', () => {
    const dispatch = jest.fn();
    const conversation = { id: 4 } as Conversation;
    const actionsModalSheetRef = { current: { present: jest.fn() } } as never;

    openStageSheet(dispatch, conversation, actionsModalSheetRef);

    expect(dispatch).toHaveBeenCalledWith(selectSingleConversation(conversation));
    expect(dispatch).toHaveBeenCalledWith(setActionState('Stage'));
    expect(
      (actionsModalSheetRef as unknown as { current: { present: jest.Mock } }).current.present,
    ).toHaveBeenCalled();
  });

  it('диалог ещё не загружен — ничего не диспатчит, шторку не открывает', () => {
    const dispatch = jest.fn();
    const actionsModalSheetRef = { current: { present: jest.fn() } } as never;

    openStageSheet(dispatch, undefined, actionsModalSheetRef);

    expect(dispatch).not.toHaveBeenCalled();
    expect(
      (actionsModalSheetRef as unknown as { current: { present: jest.Mock } }).current.present,
    ).not.toHaveBeenCalled();
  });
});
