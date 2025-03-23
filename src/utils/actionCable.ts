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

  constructor(pubSubToken: string, webSocketUrl: string, accountId: number, userId: number) {
    super(pubSubToken, webSocketUrl, accountId, userId);
    this.CancelTyping = {};
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
  };

  onConversationCreated = (data: Conversation) => {
    const conversation = transformConversation(data);
    store.dispatch(addConversation(conversation));
    store.dispatch(addContact(conversation));
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
  };

  onStatusChange = (data: Conversation) => {
    const conversation = transformConversation(data);
    store.dispatch(updateConversation(conversation));
  };

  onConversationRead = (data: Conversation) => {
    const conversation = transformConversation(data);
    store.dispatch(updateConversation(conversation));
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
}

export default {
  init({ pubSubToken, webSocketUrl, accountId, userId }: ActionCableConfig) {
    return new ActionCableConnector(pubSubToken, webSocketUrl, accountId, userId);
  },
};
