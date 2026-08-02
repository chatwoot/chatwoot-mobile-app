// [conomni] задача C7: чистые функции контейнера шапки чата, вынесенные ради тестируемости
// (нет @testing-library в проекте — сам контейнер не рендерится).
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
