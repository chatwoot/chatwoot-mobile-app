import { ActionCable, Cable } from '@kesha-antonov/react-native-action-cable';
import { WEB_SOCKET_URL } from '../constants/url';

const connectActionCable = ActionCable.createConsumer(WEB_SOCKET_URL);

const cable = new Cable({});

import { getPubSubToken } from './AuthHelper';

import { addConversation, addMessage } from '../actions/conversation';

import { store } from '../store';

class ActionCableConnector {
  constructor(pubSubToken) {
    const channel = cable.setChannel(
      'RoomChannel',
      connectActionCable.subscriptions.create({
        channel: 'RoomChannel',
        pubsub_token: pubSubToken,
      }),
    );
    channel.on('received', this.onReceived);

    this.events = {
      'message.created': this.onMessageCreated,
      'conversation.created': this.onConversationCreated,
      'status_change:conversation': this.onStatusChange,
      'user:logout': this.onLogout,
      'page:reload': this.onReload,
      'assignee.changed': this.onAssigneeChanged,
    };
  }

  onReceived = ({ event, data } = {}) => {
    if (this.events[event] && typeof this.events[event] === 'function') {
      this.events[event](data);
    }
  };

  onAssigneeChanged = payload => {};

  onConversationCreated = conversation => {
    store.dispatch(addConversation({ conversation }));
  };

  onMessageCreated = message => {
    store.dispatch(addMessage({ message }));
  };

  onStatusChange = data => {};

  handleReceived = data => {};
}

export async function initActionCable() {
  const pubSubToken = await getPubSubToken();

  const actionCable = new ActionCableConnector(pubSubToken);
  return actionCable;
}
