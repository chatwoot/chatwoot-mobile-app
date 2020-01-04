import BaseActionCableConnector from './BaseActionCableConnector';
import { getPubSubToken } from './AuthHelper';

import { store } from '../store';
import { addConversation } from '../actions/conversation';

class ActionCableConnector extends BaseActionCableConnector {
  constructor(pubSubToken) {
    super(pubSubToken);

    this.events = {
      'message.created': this.onMessageCreated,
      'conversation.created': this.onConversationCreated,
      'status_change:conversation': this.onStatusChange,
      'user:logout': this.onLogout,
      'page:reload': this.onReload,
      'assignee.changed': this.onAssigneeChanged,
    };
  }

  onAssigneeChanged = payload => {
    const { meta = {}, id } = payload;
    const { assignee } = meta || {};
    if (id) {
      //   this.app.$store.dispatch('updateAssignee', { id, assignee });
    }
  };

  onConversationCreated = data => {};

  onMessageCreated = data => {
    store.dispatch(addConversation(data));
    // this.app.$store.dispatch('addMessage', data);
  };

  onStatusChange = data => {
    // this.app.$store.dispatch('addConversation', data);
  };

  handleReceived = data => {};
}

export async function init() {
  const pubSubToken = await getPubSubToken();

  const actionCable = new ActionCableConnector(pubSubToken);
  return actionCable;
}
