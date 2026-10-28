import { ActionCable } from '@kesha-antonov/react-native-action-cable';

describe('ActionCable server control frames', () => {
  const createConnection = () => {
    const consumer = ActionCable.createConsumer('wss://example.test/cable');
    const connection = consumer.connection;
    jest.spyOn(connection, 'isProtocolSupported').mockReturnValue(true);
    const close = jest.spyOn(connection, 'close').mockImplementation(() => undefined);
    const receive = (frame: unknown) =>
      connection.events.message.call(connection, { data: JSON.stringify(frame) });
    return { consumer, connection, close, receive };
  };

  it.each([true, false])(
    'honors a server disconnect with reconnect=%s without dispatching it',
    reconnect => {
      const { consumer, close, receive } = createConnection();
      const notify = jest.spyOn(consumer.subscriptions, 'notify');
      expect(() =>
        receive({ type: 'disconnect', reason: 'server_restart', reconnect }),
      ).not.toThrow();
      expect(close).toHaveBeenCalledWith({ allowReconnect: reconnect });
      expect(notify).not.toHaveBeenCalled();
    },
  );

  it.each([undefined, null, 42, {}])(
    'ignores an unaddressed frame with identifier %s',
    identifier => {
      const { consumer, receive } = createConnection();
      const notify = jest.spyOn(consumer.subscriptions, 'notify');
      expect(() => receive({ identifier, type: 'future_control' })).not.toThrow();
      expect(notify).not.toHaveBeenCalled();
    },
  );

  it('keeps heartbeat, subscription confirmation and addressed application delivery working', () => {
    const { consumer, connection, receive } = createConnection();
    const received = jest.fn();
    const connected = jest.fn();
    const identifier = JSON.stringify({ channel: 'RoomChannel' });
    consumer.subscriptions.subscriptions.push({ identifier, received, connected });
    const ping = jest.spyOn(connection.monitor, 'recordPing');
    receive({ type: 'ping', message: 123 });
    receive({ type: 'confirm_subscription', identifier });
    const message = { event: 'message.created', data: { conversation_id: 1, id: 9 } };
    receive({ identifier, message });
    expect(ping).toHaveBeenCalledTimes(1);
    expect(connected).toHaveBeenCalledTimes(1);
    expect(received).toHaveBeenCalledWith(message);
  });
});
