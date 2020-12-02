import BaseActionCableConnector from './BaseActionCableConnector';

import {
  addOrUpdateConversation,
  addMessageToConversation,
  addUserTypingToConversation,
  removeUserFromTypingConversation,
  addOrUpdateActiveContacts,
} from '../actions/conversation';

import { addOrUpdateActiveUsers } from '../actions/auth';

import { store } from '../store';

class ActionCableConnector extends BaseActionCableConnector {
  constructor(pubsubToken, webSocketUrl, accountId, userId) {
    super(pubsubToken, webSocketUrl, accountId, userId);
    this.CancelTyping = [];
    this.events = {
      'conversation.opened': this.onConversationStatusChange,
      'conversation.resolved': this.onConversationStatusChange,
      'message.created': this.onMessageCreated,
      'conversation.created': this.onConversationCreated,
      'conversation.typing_on': this.onTypingOn,
      'conversation.typing_off': this.onTypingOff,
      'presence.update': this.onPresenceUpdate,
    };
  }

  onConversationStatusChange = () => {};

  onConversationCreated = (conversation) => {
    store.dispatch(addOrUpdateConversation({ conversation }));
  };

  onMessageCreated = (message) => {
    store.dispatch(addMessageToConversation({ message }));
  };

  onTypingOn = ({ conversation, user }) => {
    const conversationId = conversation.id;

    this.clearTimer(conversationId);
    store.dispatch(
      addUserTypingToConversation({
        conversation,
        user,
      }),
    );
    this.initTimer({ conversation, user });
  };

  onTypingOff = ({ conversation, user }) => {
    const conversationId = conversation.id;

    this.clearTimer(conversationId);

    store.dispatch(
      removeUserFromTypingConversation({
        conversation,
        user,
      }),
    );
  };

  initTimer = ({ conversation, user }) => {
    const conversationId = conversation.id;
    // Turn off typing automatically after 30 seconds
    this.CancelTyping[conversationId] = setTimeout(() => {
      this.onTypingOff({ conversation, user });
    }, 30000);
  };

  clearTimer = (conversationId) => {
    const timerEvent = this.CancelTyping.length && this.CancelTyping[conversationId];

    if (timerEvent) {
      clearTimeout(timerEvent);
      this.CancelTyping[conversationId] = null;
    }
  };
  onPresenceUpdate = ({ contacts, users }) => {
    store.dispatch(
      addOrUpdateActiveContacts({
        contacts,
      }),
    );
    store.dispatch(
      addOrUpdateActiveUsers({
        users,
      }),
    );
  };

  onAssigneeChanged = (payload) => {};

  onStatusChange = (data) => {};

  handleReceived = (data) => {};
}

export default {
  init({ pubSubToken, webSocketUrl, accountId, userId }) {
    const actionCable = new ActionCableConnector(pubSubToken, webSocketUrl, accountId, userId);

    return actionCable;
  },
};
