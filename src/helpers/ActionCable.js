import BaseActionCableConnector from './BaseActionCableConnector';

import {
  addOrUpdateConversation,
  addMessageToConversation,
  addUserTypingToConversation,
  removeUserFromTypingConversation,
} from '../actions/conversation';

import { store } from '../store';

class ActionCableConnector extends BaseActionCableConnector {
  constructor(pubsubToken, webSocketUrl) {
    super(pubsubToken, webSocketUrl);
    this.CancelTyping = [];
    this.events = {
      'message.created': this.onMessageCreated,
      'conversation.created': this.onConversationCreated,
      'conversation.typing_on': this.onTypingOn,
      'conversation.typing_off': this.onTypingOff,
    };
  }

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
    const timerEvent =
      this.CancelTyping.length && this.CancelTyping[conversationId];

    if (timerEvent) {
      clearTimeout(timerEvent);
      this.CancelTyping[conversationId] = null;
    }
  };

  onAssigneeChanged = (payload) => {};

  onStatusChange = (data) => {};

  handleReceived = (data) => {};
}

export default {
  init({ pubSubToken, webSocketUrl }) {
    const actionCable = new ActionCableConnector(pubSubToken, webSocketUrl);

    return actionCable;
  },
};
