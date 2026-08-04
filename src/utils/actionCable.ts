import {
  updateConversation,
  updateConversationLastActivity,
  addConversation,
  addOrUpdateMessage,
} from '@/store/conversation/conversationSlice';
import { addContact, updateContact, updateContactsPresence } from '@/store/contact/contactSlice';
import { setTypingUsers, removeTypingUser } from '@/store/conversation/conversationTypingSlice';
import BaseActionCableConnector from './baseActionCableConnector';
import { store } from '@/store';
import { Contact, Conversation, Message, PresenceUpdateData, TypingData } from '@/types';
import {
  transformMessage,
  transformConversation,
  transformTypingData,
  transformContact,
  transformNotificationCreatedResponse,
  transformNotificationRemovedResponse,
} from './camelCaseKeys';
import { addNotification } from '@/store/notification/notificationSlice';
import { setCurrentUserAvailability } from '@/store/auth/authSlice';
import { removeNotification } from '@/store/notification/notificationSlice';
import {
  NotificationCreatedResponse,
  NotificationRemovedResponse,
} from '@/store/notification/notificationTypes';
import { chatListActions } from '@/store/chat-list/chatListActions';
import {
  createChatListLiveUpdates,
  ChatListLiveUpdates,
} from '@/store/chat-list/chatListLiveUpdates';

interface ActionCableConfig {
  pubSubToken: string;
  webSocketUrl: string;
  accountId: number;
  userId: number;
}

class ActionCableConnector extends BaseActionCableConnector {
  private CancelTyping: { [key: number]: NodeJS.Timeout | null };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected events: { [key: string]: (data: any) => void };
  // C9 «Живое обновление списков»: копилка display_id, изменённых событиями ниже — раз в
  // 3 секунды одним запросом дёргает fetchRows (см. chatListLiveUpdates.ts). Живёт на
  // экземпляре коннектора, а не модулем-синглтоном, чтобы disconnect() снимал таймер именно
  // этого соединения и не тёк, если коннектор пересоздадут.
  private chatListLiveUpdates: ChatListLiveUpdates;

  constructor(pubSubToken: string, webSocketUrl: string, accountId: number, userId: number) {
    super(pubSubToken, webSocketUrl, accountId, userId);
    this.CancelTyping = {};
    this.chatListLiveUpdates = createChatListLiveUpdates({
      onFlush: ids => {
        store.dispatch(chatListActions.fetchLiveRows({ ids }));
      },
    });
    this.events = {
      'message.created': this.onMessageCreated,
      'message.updated': this.onMessageUpdated,
      'conversation.created': this.onConversationCreated,
      'conversation.status_changed': this.onStatusChange,
      'conversation.read': this.onConversationRead,
      'assignee.changed': this.onAssigneeChanged,
      'conversation.updated': this.onConversationUpdated,
      'conversation.typing_on': this.onTypingOn,
      'conversation.typing_off': this.onTypingOff,
      'contact.updated': this.onContactUpdate,
      'notification.created': this.onNotificationCreated,
      'notification.deleted': this.onNotificationRemoved,
      'presence.update': this.onPresenceUpdate,

      // TODO: Handle all these events later
      // 'conversation.contact_changed': this.onConversationContactChange,
      // 'contact.deleted': this.onContactDelete,
      // 'conversation.mentioned': this.onConversationMentioned,
      // 'first.reply.created': this.onFirstReplyCreated,
    };
  }

  onMessageCreated = (data: Message) => {
    const message = transformMessage(data);
    const { conversation, conversationId } = message;
    const lastActivityAt = conversation?.lastActivityAt;
    store.dispatch(updateConversationLastActivity({ lastActivityAt, conversationId }));
    store.dispatch(addOrUpdateMessage(message));
    // C9: сообщение — сигнал, что строка списка чата с этим display_id могла измениться
    // (last_message/last_activity_at/human_waiting_since); полезной нагрузки события для
    // самой строки не хватает, поэтому копим id и не собираем карточку из события.
    this.chatListLiveUpdates.registerConversationId(conversationId);
  };

  onConversationCreated = (data: Conversation) => {
    const conversation = transformConversation(data);
    store.dispatch(addConversation(conversation));
    store.dispatch(addContact(conversation));
    // C9: новый диалог может появиться в списке впервые (id ранее не встречался — копилка
    // это не проверяет, id просто попадает в следующий запрос строк), плюс отдельный сигнал
    // перезапросить бейджи меню — сразу, а не вместе с батчем строк.
    this.chatListLiveUpdates.registerConversationId(conversation.id);
    store.dispatch(chatListActions.fetchBadgeCounters());
  };

  onMessageUpdated = (data: Message) => {
    const message = transformMessage(data);
    store.dispatch(addOrUpdateMessage(message));
  };

  onConversationUpdated = (data: Conversation) => {
    const conversation = transformConversation(data);
    store.dispatch(updateConversation(conversation));
    store.dispatch(addContact(conversation));
  };

  onAssigneeChanged = (data: Conversation) => {
    const conversation = transformConversation(data);
    store.dispatch(updateConversation(conversation));
    // C9: смена ответственного двигает строку между вкладками "Новые"/"Мои" — сигнал.
    this.chatListLiveUpdates.registerConversationId(conversation.id);
  };

  onStatusChange = (data: Conversation) => {
    const conversation = transformConversation(data);
    store.dispatch(updateConversation(conversation));
    // C9: смена статуса двигает строку между вкладками (напр. в архив) — сигнал.
    this.chatListLiveUpdates.registerConversationId(conversation.id);
  };

  onConversationRead = (data: Conversation) => {
    const conversation = transformConversation(data);
    store.dispatch(updateConversation(conversation));
    // C9: прочтение меняет unread_count строки списка — сигнал.
    this.chatListLiveUpdates.registerConversationId(conversation.id);
  };

  onContactUpdate = (data: Contact) => {
    const contact = transformContact(data);
    store.dispatch(updateContact(contact));
  };

  onNotificationCreated = (data: NotificationCreatedResponse) => {
    const notification: NotificationCreatedResponse = transformNotificationCreatedResponse(data);
    store.dispatch(addNotification(notification));
  };

  onNotificationRemoved = (data: NotificationRemovedResponse) => {
    const notification: NotificationRemovedResponse = transformNotificationRemovedResponse(data);
    store.dispatch(removeNotification(notification));
  };

  onTypingOn = (data: TypingData) => {
    const typingData = transformTypingData(data);
    const { conversation, user } = typingData;
    const conversationId = conversation.id;
    store.dispatch(setTypingUsers({ conversationId, user }));
    this.initTimer(typingData);
  };

  onTypingOff = (data: TypingData) => {
    const typingData = transformTypingData(data);
    const { conversation, user } = typingData;
    const conversationId = conversation.id;
    store.dispatch(removeTypingUser({ conversationId, user }));
    this.clearTimer(conversationId);
  };

  private initTimer = (data: TypingData) => {
    const { conversation } = data;
    const conversationId = conversation.id;
    if (this.CancelTyping[conversationId]) {
      clearTimeout(this.CancelTyping[conversationId]!);
      this.CancelTyping[conversationId] = null;
    }
    this.CancelTyping[conversationId] = setTimeout(() => {
      this.onTypingOff(data);
    }, 30000);
  };

  private clearTimer = (conversationId: number) => {
    if (this.CancelTyping[conversationId]) {
      clearTimeout(this.CancelTyping[conversationId]!);
      this.CancelTyping[conversationId] = null;
    }
  };

  onPresenceUpdate = (data: PresenceUpdateData) => {
    const { contacts, users } = data;
    store.dispatch(
      updateContactsPresence({
        contacts,
      }),
    );
    store.dispatch(
      setCurrentUserAvailability({
        users,
      }),
    );
  };

  /**
   * C9: снимает таймер живого обновления списков — обязателен при отключении сокета,
   * иначе накопитель продолжает копить id и тикать в фоне без адресата (§7 спеки волны).
   * Публичный метод инстанса (не модуль-синглтон): у него нет собственного слушателя на
   * `disconnected` — `BaseActionCableConnector` не отдаёт наружу канал/эмиттер, на котором
   * можно было бы штатно подписаться из этого файла (см. отчёт задачи C9). Метод —
   * готовый явный хук для места, которое управляет жизненным циклом соединения (логаут,
   * пересоздание коннектора и т.п.).
   */
  disconnect = (): void => {
    this.chatListLiveUpdates.stop();
  };
}

export default {
  init({ pubSubToken, webSocketUrl, accountId, userId }: ActionCableConfig) {
    return new ActionCableConnector(pubSubToken, webSocketUrl, accountId, userId);
  },
};
