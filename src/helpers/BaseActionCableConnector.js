import { ActionCable, Cable } from '@kesha-antonov/react-native-action-cable';

const cable = new Cable({});

const channelName = 'RoomChannel';
const PRESENCE_INTERVAL = 60000;

class BaseActionCableConnector {
  constructor(pubSubToken, webSocketUrl, accountId, userId) {
    const connectActionCable = ActionCable.createConsumer(webSocketUrl);

    const channel = cable.setChannel(
      channelName,
      connectActionCable.subscriptions.create(
        {
          channel: channelName,
          pubsub_token: pubSubToken,
          account_id: accountId,
          user_id: userId,
        },
        {
          updatePresence() {
            this.perform('update_presence');
          },
        },
      ),
    );
    channel.on('received', this.onReceived);
    this.events = {};
    this.accountId = accountId;
    this.isAValidEvent = () => true;
    setInterval(() => {
      cable.channel(channelName).perform('update_presence');
    }, PRESENCE_INTERVAL);
  }

  onReceived = ({ event, data } = {}) => {
    if (this.isAValidEvent(data)) {
      if (this.events[event] && typeof this.events[event] === 'function') {
        const { account_id } = data;
        // Check account in incoming data  is matching to currently using account
        if (this.accountId === account_id) {
          this.events[event](data);
        }
      }
    }
  };
}

export default BaseActionCableConnector;
