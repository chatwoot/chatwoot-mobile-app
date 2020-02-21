import BaseActionCableConnector from './BaseActionCableConnector';

import {
  addConversation,
  addMessageToConversation,
} from '../actions/conversation';

import { store } from '../store';

class ActionCableConnector extends BaseActionCableConnector {
  constructor(pubsubToken) {
    super(pubsubToken);

    this.events = {
      'message.created': this.onMessageCreated,
      'conversation.created': this.onConversationCreated,
    };
  }

  onConversationCreated = conversation => {
    store.dispatch(addConversation({ conversation }));
  };

  onMessageCreated = message => {
    store.dispatch(addMessageToConversation({ message }));
  };

  onAssigneeChanged = payload => {};

  onStatusChange = data => {};

  handleReceived = data => {};
}

export default {
  init({ pubSubToken }) {
    const actionCable = new ActionCableConnector(pubSubToken);

    return actionCable;
  },
};
