import { MESSAGE_STATUS, MESSAGE_TYPES } from '@/constants';
import { store } from '@/store';
import { setCurrentUserAvailability } from '@/store/auth/authSlice';
import { addContact, updateContact, updateContactsPresence } from '@/store/contact/contactSlice';
import {
  addConversation,
  addOrUpdateMessage,
  updateConversation,
  updateConversationLastActivity,
} from '@/store/conversation/conversationSlice';
import { removeTypingUser, setTypingUsers } from '@/store/conversation/conversationTypingSlice';
import { addNotification, removeNotification } from '@/store/notification/notificationSlice';
import {
  NotificationCreatedResponse,
  NotificationRemovedResponse,
} from '@/store/notification/notificationTypes';
import { Contact, Conversation, Message, PresenceUpdateData, TypingData } from '@/types';
import BaseActionCableConnector from './baseActionCableConnector';
import {
  transformContact,
  transformConversation,
  transformMessage,
  transformNotificationCreatedResponse,
  transformNotificationRemovedResponse,
  transformTypingData,
} from './camelCaseKeys';

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

    const isOutgoingMessage = message.messageType === MESSAGE_TYPES.OUTGOING;
    const hasEchoId = message.echoId;

    if (isOutgoingMessage && hasEchoId) {
      const state = store.getState();
      const conversationState = state.conversations.entities[conversationId];

      if (conversationState) {
        const existingMessage = conversationState.messages.find(
          m => m.echoId === message.echoId && m.status === MESSAGE_STATUS.PROGRESS,
        );

        if (existingMessage) {
          return;
        }
      }
    }

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
    const isOutgoingMessage = message.messageType === MESSAGE_TYPES.OUTGOING;

    if (isOutgoingMessage) {
      const state = store.getState();
      const conversationState = state.conversations.entities[message.conversationId];

      if (conversationState) {
        const existingMessage = conversationState.messages.find(m => {
          const sameEcho = message.echoId && m.echoId === message.echoId;
          const sameId = m.id === message.id;
          return (
            sameEcho ||
            (sameId &&
              (m.status === MESSAGE_STATUS.PROGRESS ||
                m.status === MESSAGE_STATUS.SENT ||
                m.status === MESSAGE_STATUS.FAILED))
          );
        });


        if (existingMessage) {
          if (message.status === MESSAGE_STATUS.FAILED) {
            store.dispatch(
              addOrUpdateMessage({
                ...message,
                echoId: message.echoId ?? existingMessage.echoId,
              }),
            );
            return;
          }

          if (existingMessage.status === MESSAGE_STATUS.PROGRESS) {
            store.dispatch(
              addOrUpdateMessage({
                ...message,
                echoId: message.echoId ?? existingMessage.echoId,
              }),
            );
            return;
          }

          if (
            existingMessage.status === MESSAGE_STATUS.SENT &&
            (message.status === MESSAGE_STATUS.DELIVERED || message.status === MESSAGE_STATUS.READ)
          ) {
            store.dispatch(
              addOrUpdateMessage({
                ...message,
                echoId: message.echoId ?? existingMessage.echoId,
              }),
            );
            return;
          }

          if (existingMessage.status === MESSAGE_STATUS.SENT && !message.status) {
            return;
          }
        }
      }
    }

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
