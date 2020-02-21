import { ActionCable, Cable } from '@kesha-antonov/react-native-action-cable';
import { WEB_SOCKET_URL } from '../constants/url';

const connectActionCable = ActionCable.createConsumer(WEB_SOCKET_URL);

const cable = new Cable({});

const channelName = 'RoomChannel';

class BaseActionCableConnector {
  constructor(pubSubToken) {
    const channel = cable.setChannel(
      channelName,
      connectActionCable.subscriptions.create({
        channel: channelName,
        pubsub_token: pubSubToken,
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
