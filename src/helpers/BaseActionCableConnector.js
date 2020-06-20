import { ActionCable, Cable } from '@kesha-antonov/react-native-action-cable';

const cable = new Cable({});

const channelName = 'RoomChannel';

class BaseActionCableConnector {
  constructor(pubSubToken, webSocketUrl, accountId) {
    const connectActionCable = ActionCable.createConsumer(webSocketUrl);

    const channel = cable.setChannel(
      channelName,
      connectActionCable.subscriptions.create({
        channel: channelName,
        pubsub_token: pubSubToken,
      }),
    );
    channel.on('received', this.onReceived);
    this.events = {};
    this.accountId = accountId;
  }

  onReceived = ({ event, data } = {}) => {
    if (this.events[event] && typeof this.events[event] === 'function') {
      const { account_id } = data;
      // Check account in incoming data  is matching to currently using account
      if (this.accountId === account_id) {
        this.events[event](data);
      }
    }
  };
}

export default BaseActionCableConnector;
