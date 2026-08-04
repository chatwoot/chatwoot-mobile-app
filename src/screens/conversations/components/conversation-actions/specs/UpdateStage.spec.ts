/* eslint-disable import/first -- jest.mock ставим до импортов: шимы нативных модулей должны быть видны глазом раньше кода, который их требует */
// [conomni] задача C7: в проекте нет @testing-library — компонент UpdateStage сам не
// рендерится, тестируем чистые функции, вынесенные из него специально ради тестируемости
// (тот же приём, что ChannelBrandMark.spec.ts / FunnelScreen.spec.ts).
// UpdateStage.tsx рендерит BottomSheetHeader/Icon (@/components-next) → барель index.ts
// реэкспортит ВСЕ подпапки next-компонентов, включая чужие (@/utils →
// react-native-keyboard-controller, LabelActions → @/hooks → react-redux,
// AttributeList → @react-native-clipboard/clipboard) — без линковки/ESM-транспиляции они
// падают при простом require в jest. Три моки ниже — починка окружения теста (компонент
// не рендерится), тот же приём, что ChatListRow.spec.ts / ChatListScreen.spec.ts.
jest.mock('react-native-keyboard-controller', () => ({ useKeyboardHandler: jest.fn() }));
jest.mock('react-redux', () => ({ useDispatch: jest.fn(), useSelector: jest.fn() }));
jest.mock('@react-native-clipboard/clipboard', () => ({
  getString: jest.fn(),
  setString: jest.fn(),
}));

import { stageUpdatePayload, handleStageSelect } from '../UpdateStage';
import { funnelActions } from '@/store/funnel/funnelActions';
import { conversationActions } from '@/store/conversation/conversationActions';
import { showToast } from '@/utils/toastUtils';

jest.mock('@/store/funnel/funnelActions', () => ({
  funnelActions: {
    updateConversationFunnel: jest.fn(payload => ({
      type: 'funnel/updateConversationFunnel',
      payload,
    })),
  },
}));

jest.mock('@/store/conversation/conversationActions', () => ({
  conversationActions: {
    fetchConversation: jest.fn(conversationId => ({
      type: 'conversations/fetchConversation',
      payload: conversationId,
    })),
  },
}));

jest.mock('@/utils/toastUtils', () => ({
  showToast: jest.fn(),
}));

describe('stageUpdatePayload', () => {
  it('собирает payload из conversationId и stageId', () => {
    expect(stageUpdatePayload(42, 7)).toEqual({ conversationId: 42, stageId: 7 });
  });

  it('stageId может быть null — снять этап («Без этапа»)', () => {
    expect(stageUpdatePayload(42, null)).toEqual({ conversationId: 42, stageId: null });
  });
});

describe('handleStageSelect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('при успехе шлёт stage_id/conversationId, перечитывает диалог и закрывает шторку', async () => {
    const dispatch = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({ id: 1 }) });
    const actionsModalSheetRef = { current: { dismiss: jest.fn() } } as never;

    await handleStageSelect(dispatch, 42, 7, actionsModalSheetRef);

    expect(funnelActions.updateConversationFunnel).toHaveBeenCalledWith({
      conversationId: 42,
      stageId: 7,
    });
    expect(conversationActions.fetchConversation).toHaveBeenCalledWith(42);
    expect(
      (actionsModalSheetRef as unknown as { current: { dismiss: jest.Mock } }).current.dismiss,
    ).toHaveBeenCalledWith({ overshootClamping: true });
    expect(showToast).not.toHaveBeenCalled();
  });

  it('на ошибке запроса показывает тост CONOMNI.STAGE.UPDATE_FAILED и не закрывает шторку', async () => {
    const dispatch = jest.fn().mockReturnValue({ unwrap: () => Promise.reject(new Error('boom')) });
    const actionsModalSheetRef = { current: { dismiss: jest.fn() } } as never;

    await handleStageSelect(dispatch, 42, null, actionsModalSheetRef);

    expect(showToast).toHaveBeenCalledTimes(1);
    expect(
      (actionsModalSheetRef as unknown as { current: { dismiss: jest.Mock } }).current.dismiss,
    ).not.toHaveBeenCalled();
    expect(conversationActions.fetchConversation).not.toHaveBeenCalled();
  });
});
