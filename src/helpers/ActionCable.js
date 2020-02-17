import { ActionCable, Cable } from '@kesha-antonov/react-native-action-cable';
import { WEB_SOCKET_URL } from '../constants/url';
import { getPubSubToken } from './AuthHelper';

import {
  addConversation,
  addMessageToConversation,
} from '../actions/conversation';

import { store } from '../store';

const connectActionCable = ActionCable.createConsumer(WEB_SOCKET_URL);

const cable = new Cable({});

const channelName = 'RoomChannel';

let channel = null;

class ActionCableConnector {
  constructor(pubSubToken) {
    connectActionCable.disconnect();

    if (!channel) {
      channel = cable.setChannel(
        channelName,
        connectActionCable.subscriptions.create({
          channel: channelName,
          pubsub_token: pubSubToken,
        }),
      );
    }

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
    // console.log('event, data', event, data);

    if (this.events[event] && typeof this.events[event] === 'function') {
      this.events[event](data);
    }
  };

  onAssigneeChanged = payload => {};

  onConversationCreated = conversation => {
    store.dispatch(addConversation({ conversation }));
  };

  onMessageCreated = message => {
    store.dispatch(addMessageToConversation({ message }));
  };

  onStatusChange = data => {};

  handleReceived = data => {};
}

export async function initActionCable() {
  const pubSubToken = await getPubSubToken();

  const actionCable = new ActionCableConnector(pubSubToken);
  return actionCable;
}
