import BaseActionCableConnector from './BaseActionCableConnector';

import {
  addOrUpdateConversation,
  addMessageToConversation,
} from '../actions/conversation';

import { store } from '../store';

class ActionCableConnector extends BaseActionCableConnector {
  constructor(pubsubToken, webSocketUrl) {
    super(pubsubToken, webSocketUrl);

    this.events = {
      'message.created': this.onMessageCreated,
      'conversation.created': this.onConversationCreated,
    };
  }

  onConversationCreated = (conversation) => {
    store.dispatch(addOrUpdateConversation({ conversation }));
  };

  onMessageCreated = (message) => {
    store.dispatch(addMessageToConversation({ message }));
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
