import BaseActionCableConnector from './BaseActionCableConnector';

import {
  addMessage,
  addConversation,
  updateConversation,
  // updateContactsPresence,
  actions as conversationActions,
} from 'reducer/conversationSlice';

// import { addOrUpdateActiveUsers } from '../actions/auth';

import { store } from '../store';

class ActionCableConnector extends BaseActionCableConnector {
  constructor(pubsubToken, webSocketUrl, accountId, userId) {
    super(pubsubToken, webSocketUrl, accountId, userId);
    this.CancelTyping = [];
    this.events = {
      'message.created': this.onMessageCreated,
      'message.updated': this.onMessageUpdated,
      'conversation.created': this.onConversationCreated,
      'conversation.status_changed': this.onStatusChange,
      'assignee.changed': this.onAssigneeChanged,
      'conversation.read': this.onConversationRead,
      // 'presence.update': this.onPresenceUpdate,
      // TODO: Handle all these events
      // 'conversation.typing_on': this.onTypingOn,
      // 'conversation.typing_off': this.onTypingOff,
      //   'conversation.contact_changed': this.onConversationContactChange,
      //   'contact.deleted': this.onContactDelete,
      //   'contact.updated': this.onContactUpdate,
      //   'conversation.mentioned': this.onConversationMentioned,
      //   'notification.created': this.onNotificationCreated,
      //   'first.reply.created': this.onFirstReplyCreated,
    };
  }

  onMessageCreated = message => {
    store.dispatch(addMessage(message));
  };

  onMessageUpdated = data => {
    store.dispatch(addMessage(data));
  };

  onConversationCreated = data => {
    store.dispatch(addConversation(data));
    store.dispatch(conversationActions.fetchConversationStats({}));
  };

  onStatusChange = data => {
    store.dispatch(updateConversation(data));
  };

  onAssigneeChanged = data => {
    const { id } = data;
    if (id) {
      store.dispatch(updateConversation(data));
    }
    store.dispatch(conversationActions.fetchConversationStats({}));
  };

  onConversationRead = data => {
    store.dispatch(updateConversation(data));
  };

  onTypingOn = ({ conversation, user }) => {
    const conversationId = conversation.id;

    this.clearTimer(conversationId);
    // store.dispatch(
    //   addUserTypingToConversation({
    //     conversation,
    //     user,
    //   }),
    // );
    this.initTimer({ conversation, user });
  };

  onTypingOff = ({ conversation, user }) => {
    const conversationId = conversation.id;

    this.clearTimer(conversationId);

    // store.dispatch(
    //   removeUserFromTypingConversation({
    //     conversation,
    //     user,
    //   }),
    // );
  };

  initTimer = ({ conversation, user }) => {
    const conversationId = conversation.id;
    // Turn off typing automatically after 30 seconds
    this.CancelTyping[conversationId] = setTimeout(() => {
      this.onTypingOff({ conversation, user });
    }, 30000);
  };

  clearTimer = conversationId => {
    const timerEvent = this.CancelTyping.length && this.CancelTyping[conversationId];

    if (timerEvent) {
      clearTimeout(timerEvent);
      this.CancelTyping[conversationId] = null;
    }
  };
  onPresenceUpdate = ({ contacts, users }) => {
    // store.dispatch(
    //   addOrUpdateActiveContacts({
    //     contacts,
    //   }),
    // );
    // store.dispatch(
    //   addOrUpdateActiveUsers({
    //     users,
    //   }),
    // );
  };

  handleReceived = data => {};
}

export default {
  init({ pubSubToken, webSocketUrl, accountId, userId }) {
    const actionCable = new ActionCableConnector(pubSubToken, webSocketUrl, accountId, userId);

    return actionCable;
  },
};
