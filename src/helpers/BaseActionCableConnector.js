import { ActionCable, Cable } from '@kesha-antonov/react-native-action-cable';
import { AppState } from 'react-native';

const cable = new Cable({});
const channelName = 'RoomChannel';
const RECONNECT_INTERVAL = 5000; // 5 seconds
const PRESENCE_INTERVAL = 20000; // 20 seconds

class BaseActionCableConnector {
  constructor(pubSubToken, webSocketUrl, accountId, userId) {
    this.pubSubToken = pubSubToken;
    this.webSocketUrl = webSocketUrl;
    this.accountId = accountId;
    this.userId = userId;
    this.events = {};
    this.appState = AppState.currentState;

    AppState.addEventListener('change', this.handleAppStateChange);
    this.setupChannel();
    this.reconnectInterval = null;
  }

  setupChannel = () => {
    const channel = cable.setChannel(
      channelName,
      ActionCable.createConsumer(this.webSocketUrl).subscriptions.create(
        {
          channel: channelName,
          pubsub_token: this.pubSubToken,
          account_id: this.accountId,
          user_id: this.userId,
        },
        {
          updatePresence() {
            this.perform('update_presence');
          },
        },
      ),
    );

    channel.on('received', this.onReceived);
    channel.on('connected', this.handleConnected);
    channel.on('disconnect', this.handleDisconnected);
    this.isAValidEvent = data => {
      const { account_id } = data;
      return this.accountId === account_id;
    };
    setInterval(() => {
      cable.channel(channelName).perform('update_presence');
    }, PRESENCE_INTERVAL);
  };

  handleAppStateChange = nextAppState => {
    if (this.appState.match(/inactive|background/) && nextAppState === 'active') {
      // Re-establish connection if necessary
      this.setupChannel(); // pass required parameters
    }

    if (nextAppState === 'background') {
      // Consider pausing or adjusting how you handle the WebSocket connection
    }

    this.appState = nextAppState;
  };

  onReceived = ({ event, data } = {}) => {
    if (this.isAValidEvent(data)) {
      if (this.events[event] && typeof this.events[event] === 'function') {
        this.events[event](data);
      }
    }
  };

  handleConnected = () => {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
  };

  handleDisconnected = () => {
    if (!this.reconnectInterval) {
      this.reconnectInterval = setInterval(() => {
        this.setupChannel();
      }, RECONNECT_INTERVAL);
    }
  };

  updatePresence = () => {
    if (this.channel) {
      this.channel.perform('update_presence');
    }
  };
}

export default BaseActionCableConnector;
