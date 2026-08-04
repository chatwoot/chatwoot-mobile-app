/* eslint-disable import/first -- jest.mock ставим до импортов: шимы нативных модулей должны быть видны глазом раньше кода, который их требует */
// [conomni] задача C8: карточка обращения на экране контакта. Рендер-тестов компонентов
// в проекте нет (нет @testing-library) — тестируем чистые функции, вынесенные из
// ConversationInfoSection.tsx ради тестируемости (тот же приём, что ChatHeader.spec.ts /
// UpdateStage.spec.ts).
// ConversationInfoSection.tsx переиспользует resolveConversationStageId/openStageSheet из
// ChatHeaderContainer.tsx (C7, по заданию) и resolveStageDisplay из ChatHeader.tsx —
// та же цепочка импортов, что чинит ChatHeader.spec.ts/ChatHeaderContainer.spec.ts:
// @/components-next тянет react-redux (LabelActions) и @react-native-clipboard/clipboard
// (AttributeList) через барель, DropdownMenu.tsx (соседний с ChatHeader.tsx) тянет ESM-пакет
// zeego/dropdown-menu, useHaptic тянет react-native-keyboard-controller. Мок = починка
// окружения теста, реальные хуки/нативные модули в тесте не вызываются.
jest.mock('react-redux', () => ({ useDispatch: jest.fn(), useSelector: jest.fn() }));
jest.mock('react-native-keyboard-controller', () => ({ useKeyboardHandler: jest.fn() }));
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

import {
  shouldShowConversationInfoSection,
  resolveConversationPrice,
  buildPriceUpdatePayload,
  handlePriceBlur,
} from '../components/ConversationInfoSection';
import { funnelActions } from '@/store/funnel/funnelActions';
import { showToast } from '@/utils/toastUtils';
import type { Conversation } from '@/types';

jest.mock('@/store/funnel/funnelActions', () => ({
  funnelActions: {
    updateConversationFunnel: jest.fn(payload => ({
      type: 'funnel/updateConversationFunnel',
      payload,
    })),
  },
}));

jest.mock('@/utils/toastUtils', () => ({
  showToast: jest.fn(),
}));

describe('shouldShowConversationInfoSection', () => {
  it('открыт с conversationId — секция показывается', () => {
    expect(shouldShowConversationInfoSection(42)).toBe(true);
  });

  it('открыт по contactId, conversationId нет — секция не показывается', () => {
    expect(shouldShowConversationInfoSection(undefined)).toBe(false);
  });

  it('null трактуется так же, как undefined', () => {
    expect(shouldShowConversationInfoSection(null)).toBe(false);
  });
});

describe('resolveConversationPrice', () => {
  it('берёт conomni_price из custom_attributes диалога (числом)', () => {
    const conversation = {
      customAttributes: { conomni_price: 5000 },
    } as unknown as Conversation;

    expect(resolveConversationPrice(conversation)).toBe(5000);
  });

  it('conomni_price строкой (jsonb) — тоже парсится в число', () => {
    const conversation = {
      customAttributes: { conomni_price: '5000' },
    } as unknown as Conversation;

    expect(resolveConversationPrice(conversation)).toBe(5000);
  });

  it('нет ключа в custom_attributes — null (цены нет, это не ошибка)', () => {
    const conversation = { customAttributes: {} } as unknown as Conversation;
    expect(resolveConversationPrice(conversation)).toBeNull();
  });

  it('пустая строка трактуется как «цены нет»', () => {
    const conversation = {
      customAttributes: { conomni_price: '' },
    } as unknown as Conversation;

    expect(resolveConversationPrice(conversation)).toBeNull();
  });

  it('диалог ещё не загружен — null, не падает', () => {
    expect(resolveConversationPrice(undefined)).toBeNull();
  });
});

describe('buildPriceUpdatePayload', () => {
  it('ввод «5000» — payload с price:5000 (числом)', () => {
    expect(buildPriceUpdatePayload(42, '5000')).toEqual({ conversationId: 42, price: 5000 });
  });

  it('пустой ввод — payload с пустой ценой (стирает значение)', () => {
    expect(buildPriceUpdatePayload(42, '')).toEqual({ conversationId: 42, price: '' });
  });

  it('ввод из одних пробелов — тоже стирает значение', () => {
    expect(buildPriceUpdatePayload(42, '   ')).toEqual({ conversationId: 42, price: '' });
  });

  it('нечисловой мусор — стирает значение, не шлёт NaN', () => {
    expect(buildPriceUpdatePayload(42, 'abc')).toEqual({ conversationId: 42, price: '' });
  });
});

describe('handlePriceBlur', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('при успехе шлёт PATCH с price:5000 из введённого «5000»', async () => {
    const dispatch = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({ id: 1 }) });

    await handlePriceBlur(dispatch, 42, '5000');

    expect(funnelActions.updateConversationFunnel).toHaveBeenCalledWith({
      conversationId: 42,
      price: 5000,
    });
    expect(showToast).not.toHaveBeenCalled();
  });

  it('при успехе с пустым полем шлёт PATCH с пустой ценой', async () => {
    const dispatch = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({ id: 1 }) });

    await handlePriceBlur(dispatch, 42, '');

    expect(funnelActions.updateConversationFunnel).toHaveBeenCalledWith({
      conversationId: 42,
      price: '',
    });
    expect(showToast).not.toHaveBeenCalled();
  });

  it('на ошибке запроса показывает тост CONOMNI.CONVERSATION_INFO.PRICE_FAILED', async () => {
    const dispatch = jest.fn().mockReturnValue({ unwrap: () => Promise.reject(new Error('boom')) });

    await handlePriceBlur(dispatch, 42, '5000');

    expect(showToast).toHaveBeenCalledTimes(1);
  });
});
