// [conomni] C9 «Живое обновление списков»: actionCable.ts подключает НАСТОЯЩИЙ
// BaseActionCableConnector (реальный WebSocket через @kesha-antonov/react-native-action-cable)
// и реальный Redux store (`@/store`, тяжёлый reducer-граф всего приложения). Ни то, ни
// другое поднимать в юнит-тесте незачем и небезопасно — шимим ровно так же, как
// UpdateStage.spec.ts шимит @/components-next: подменяем `../baseActionCableConnector`
// пустым классом (конструктор не создаёт сокет), `@/store` — мок с dispatch-шпионом,
// `@/store/chat-list/chatListActions` — мок с action-creator-шпионами (то есть тестируем
// САМ ФАКТ, что диспатчится ПРАВИЛЬНОЕ действие с правильным payload, а не поведение
// самого thunk'а — оно уже покрыто chatListActions.spec.ts/chatListSlice.spec.ts).
import actionCableConnector from '../actionCable';
import { store } from '@/store';
import { chatListActions } from '@/store/chat-list/chatListActions';
import { LIVE_UPDATE_FLUSH_MS } from '@/store/chat-list/chatListLiveUpdates';
import type { Message } from '@/types/Message';
import type { Conversation } from '@/types/Conversation';

jest.mock('../baseActionCableConnector', () => ({
  __esModule: true,
  default: class {},
}));

jest.mock('@/store', () => ({
  store: { dispatch: jest.fn() },
}));

jest.mock('@/store/chat-list/chatListActions', () => ({
  chatListActions: {
    fetchLiveRows: jest.fn(payload => ({ type: 'chatList/fetchLiveRows', payload })),
    fetchBadgeCounters: jest.fn(() => ({ type: 'chatList/fetchBadgeCounters' })),
  },
}));

const dispatchMock = store.dispatch as jest.Mock;
const fetchLiveRowsMock = chatListActions.fetchLiveRows as unknown as jest.Mock;
const fetchBadgeCountersMock = chatListActions.fetchBadgeCounters as unknown as jest.Mock;

// Данные событий сокета приходят snake_case "как есть с сервера" — обработчики сами
// прогоняют их через transform*-функции (@/utils/camelCaseKeys), поэтому здесь минимальные
// сырые объекты, а не уже причёсанные типы приложения.
const rawMessage = (conversationId: number) =>
  ({ id: 1, conversation_id: conversationId, account_id: 1 }) as unknown as Message;

const rawConversation = (id: number) => ({ id, account_id: 1 }) as unknown as Conversation;

const createConnector = () =>
  actionCableConnector.init({
    pubSubToken: 'token',
    webSocketUrl: 'wss://example.test/cable',
    accountId: 1,
    userId: 7,
  });

describe('actionCable: C9 живое обновление списков', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    dispatchMock.mockClear();
    fetchLiveRowsMock.mockClear();
    fetchBadgeCountersMock.mockClear();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('три РАЗНЫХ события подряд по одному id дают ОДИН запрос строк', () => {
    const connector = createConnector();

    connector.onMessageCreated(rawMessage(42));
    connector.onStatusChange(rawConversation(42));
    connector.onAssigneeChanged(rawConversation(42));

    expect(fetchLiveRowsMock).not.toHaveBeenCalled();

    jest.advanceTimersByTime(LIVE_UPDATE_FLUSH_MS);

    expect(fetchLiveRowsMock).toHaveBeenCalledTimes(1);
    expect(fetchLiveRowsMock).toHaveBeenCalledWith({ ids: [42] });
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'chatList/fetchLiveRows',
      payload: { ids: [42] },
    });
  });

  it('conversation.read по неизвестному ранее id всё равно попадает в запрос строк', () => {
    const connector = createConnector();

    connector.onConversationRead(rawConversation(777));
    jest.advanceTimersByTime(LIVE_UPDATE_FLUSH_MS);

    expect(fetchLiveRowsMock).toHaveBeenCalledWith({ ids: [777] });
  });

  it('conversation.created сигналит И накопителю строк, И бейджам (сразу, не батчем)', () => {
    const connector = createConnector();

    connector.onConversationCreated(rawConversation(99));

    // Бейджи — сразу, без ожидания окна батчинга.
    expect(fetchBadgeCountersMock).toHaveBeenCalledTimes(1);
    expect(fetchLiveRowsMock).not.toHaveBeenCalled();

    jest.advanceTimersByTime(LIVE_UPDATE_FLUSH_MS);

    expect(fetchLiveRowsMock).toHaveBeenCalledWith({ ids: [99] });
  });

  it('disconnect() снимает таймер накопителя — после отключения сокета фоновых запросов нет', () => {
    const connector = createConnector();

    connector.onMessageCreated(rawMessage(11));
    connector.disconnect();

    jest.advanceTimersByTime(LIVE_UPDATE_FLUSH_MS * 5);

    expect(fetchLiveRowsMock).not.toHaveBeenCalled();
  });

  it('существующая обработка message.created (обновление активности/сообщения) не задета', () => {
    const connector = createConnector();
    dispatchMock.mockClear();

    connector.onMessageCreated(rawMessage(55));

    // Два штатных диспатча (updateConversationLastActivity, addOrUpdateMessage) как и раньше —
    // наша правка только ДОБАВЛЯЕТ регистрацию id в накопитель, ничего не меняя в существующем.
    expect(dispatchMock).toHaveBeenCalledTimes(2);
  });
});
