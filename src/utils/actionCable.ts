import {
  updateConversation,
  updateConversationLastActivity,
  addConversation,
  addOrUpdateMessage,
} from '@/store/conversation/conversationSlice';
import { addContact, addContacts } from '@/store/contact/contactSlice';
import BaseActionCableConnector from './baseActionCableConnector';
import { store } from '@/store';
import { Conversation, Message } from '@/types';
import { transformMessage, transformConversation } from './camelcaseKeys';

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
      //   'presence.update': this.onPresenceUpdate,
      //   'conversation.typing_on': this.onTypingOn,
      //   'conversation.typing_off': this.onTypingOff,
      //   'notification.created': this.onNotificationCreated,
      //   'notification.deleted': this.onNotificationRemoved,
      // TODO: Handle all these events
      //   'conversation.contact_changed': this.onConversationContactChange,
      //   'contact.deleted': this.onContactDelete,
      //   'contact.updated': this.onContactUpdate,
      //   'conversation.mentioned': this.onConversationMentioned,
      //   'first.reply.created': this.onFirstReplyCreated,
    };
  }

  onMessageCreated = (data: Message) => {
    const message = transformMessage(data);
    const {
      conversation: { lastActivityAt },
      conversationId,
    } = message;
    store.dispatch(updateConversationLastActivity({ lastActivityAt, conversationId }));
  };

  onConversationCreated = (data: Conversation) => {
    const conversation = transformConversation(data);
    store.dispatch(addConversation(conversation));
    store.dispatch(addContacts(conversation));
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

  //   onTypingOn = (data: TypingData) => {
  //     const { conversation, user } = data;
  //     const conversationId = conversation.id;
  //     store.dispatch(
  //       conversationTypingActions.toggleTyping({
  //         conversationId,
  //         user,
  //         typing: true,
  //       }),
  //     );
  //     this.initTimer({ conversation, user });
  //   };

  //   onTypingOff = (data: TypingData) => {
  //     const { conversation, user } = data;
  //     const conversationId = conversation.id;
  //     store.dispatch(
  //       conversationTypingActions.toggleTyping({
  //         conversationId,
  //         user,
  //         typing: false,
  //       }),
  //     );
  //     this.clearTimer(conversationId);
  //   };

  //   private initTimer = ({ conversation, user }: TypingData) => {
  //     const conversationId = conversation.id;
  //     if (this.CancelTyping[conversationId]) {
  //       clearTimeout(this.CancelTyping[conversationId]!);
  //       this.CancelTyping[conversationId] = null;
  //     }
  //     this.CancelTyping[conversationId] = setTimeout(() => {
  //       store.dispatch(
  //         conversationTypingActions.toggleTyping({
  //           conversationId,
  //           user,
  //           typing: false,
  //         }),
  //       );
  //     }, 30000);
  //   };

  //   private clearTimer = (conversationId: number) => {
  //     if (this.CancelTyping[conversationId]) {
  //       clearTimeout(this.CancelTyping[conversationId]!);
  //       this.CancelTyping[conversationId] = null;
  //     }
  //   };

  //   onPresenceUpdate = (data: PresenceData) => {
  //     const { contacts, users } = data;
  //   };
}

export default {
  init({ pubSubToken, webSocketUrl, accountId, userId }: ActionCableConfig) {
    return new ActionCableConnector(pubSubToken, webSocketUrl, accountId, userId);
  },
};
