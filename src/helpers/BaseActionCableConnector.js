import { ActionCable, Cable } from '@kesha-antonov/react-native-action-cable';
import { WEB_SOCKET_URL } from '../constants/url';

const actionCable = ActionCable.createConsumer(WEB_SOCKET_URL);

const cable = new Cable({});

class BaseActionCableConnector {
  constructor(pubsubToken) {
    const channel = cable.setChannel(
      'RoomChannel',
      actionCable.subscriptions.create({
        channel: 'RoomChannel',
        pubsub_token: pubsubToken,
      }),
    );
    channel.on('received', this.onReceived);

    this.events = {};
  }

  onReceived = ({ event, data } = {}) => {
    if (this.events[event] && typeof this.events[event] === 'function') {
      this.events[event](data);
    }
  };
}

export default BaseActionCableConnector;
