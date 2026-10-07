import { conversationActions } from '../conversationActions';
import { ConversationService } from '../conversationService';
import { MESSAGE_STATUS } from '@/constants';
import type { Message } from '@/types';

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

jest.mock('@/i18n', () => ({
  t: (key: string) => key,
}));

jest.mock('../conversationService', () => ({
  ConversationService: {
    retryMessage: jest.fn(),
    sendMessage: jest.fn(),
  },
}));

const runThunk = async (message: Message) => {
  const dispatch = jest.fn();
  const thunk = conversationActions.retryMessage(message);
  await thunk(dispatch, () => ({}), undefined);
  return dispatch;
};

const addOrUpdateMessagePayloads = (dispatch: jest.Mock) =>
  dispatch.mock.calls
    .map(([action]) => action)
    .filter(action => action?.type === 'conversation/addOrUpdateMessage')
    .map(action => action.payload);

const failedMessage = (overrides: Partial<Message> = {}): Message =>
  ({
    id: 12,
    conversationId: 1,
    content: 'Hello',
    attachments: [],
    private: false,
    echoId: 'abcd1234',
    message: 'Hello',
    status: MESSAGE_STATUS.FAILED,
    contentAttributes: null,
    ...overrides,
  }) as unknown as Message;

describe('conversationActions.retryMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses the retry endpoint when the message failed with an external error', async () => {
    // The retry endpoint renders the same message partial as create, so the response carries the
    // id and conversation_id needed to move the message out of the progress state
    (ConversationService.retryMessage as jest.Mock).mockResolvedValueOnce({
      id: 12,
      conversation_id: 1,
      content: 'Hello',
      content_attributes: {},
    });

    const message = failedMessage({
      contentAttributes: { externalError: 'Recipient unreachable' },
    } as Partial<Message>);
    const dispatch = await runThunk(message);

    expect(ConversationService.retryMessage).toHaveBeenCalledWith({
      conversationId: 1,
      messageId: 12,
    });
    expect(ConversationService.sendMessage).not.toHaveBeenCalled();

    const payloads = addOrUpdateMessagePayloads(dispatch);
    expect(payloads[0].status).toBe(MESSAGE_STATUS.PROGRESS);
    // Without a conversationId and id the reducer cannot place the message and the bubble would be
    // left stuck showing as sending
    expect(payloads[1]).toEqual(
      expect.objectContaining({
        id: 12,
        conversationId: 1,
        status: MESSAGE_STATUS.SENT,
      }),
    );
  });

  it('creates the message again when it never reached the server', async () => {
    (ConversationService.sendMessage as jest.Mock).mockResolvedValueOnce({
      id: 13,
      conversation_id: 1,
      content: 'Hello',
      echo_id: 'abcd1234',
    });

    const dispatch = await runThunk(failedMessage());

    expect(ConversationService.retryMessage).not.toHaveBeenCalled();
    expect(ConversationService.sendMessage).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ content: 'Hello', echo_id: 'abcd1234' }),
      { headers: { 'Content-Type': 'application/json' } },
    );

    const payloads = addOrUpdateMessagePayloads(dispatch);
    expect(payloads[0].status).toBe(MESSAGE_STATUS.PROGRESS);
    expect(payloads[1].status).toBe(MESSAGE_STATUS.SENT);
  });

  it('creates the message again with every attached file as multipart', async () => {
    (ConversationService.sendMessage as jest.Mock).mockResolvedValueOnce({
      id: 14,
      conversation_id: 1,
      content: 'Hello',
      echo_id: 'abcd1234',
    });

    const files = [
      { uri: 'file:///tmp/a.jpg', fileName: 'a.jpg', type: 'image/jpeg' },
      { uri: 'file:///tmp/b.png', fileName: 'b.png', type: 'image/png' },
    ];
    await runThunk(
      failedMessage({ files, attachments: [{ id: 'abcd1234' }] } as unknown as Partial<Message>),
    );

    expect(ConversationService.sendMessage).toHaveBeenCalledWith(1, expect.any(FormData), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  });

  it('keeps the attachment of a message stored with a single file', async () => {
    (ConversationService.sendMessage as jest.Mock).mockResolvedValueOnce({
      id: 16,
      conversation_id: 1,
      content: 'Hello',
      echo_id: 'abcd1234',
    });
    const append = jest.spyOn(FormData.prototype, 'append');

    // Failed messages persisted before multiple attachments were supported carry `file`
    const file = { uri: 'file:///tmp/a.jpg', fileName: 'a.jpg', type: 'image/jpeg' };
    await runThunk(
      failedMessage({ file, attachments: [{ id: 'abcd1234' }] } as unknown as Partial<Message>),
    );

    expect(ConversationService.sendMessage).toHaveBeenCalledWith(1, expect.any(FormData), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expect(append).toHaveBeenCalledWith('attachments[]', {
      uri: 'file:///tmp/a.jpg',
      name: 'a.jpg',
      type: 'image/jpeg',
    });
    append.mockRestore();
  });

  it('puts the message back into a failed state when the retry fails', async () => {
    (ConversationService.sendMessage as jest.Mock).mockRejectedValueOnce({
      response: { data: { errors: ['Network unreachable'] } },
    });

    const dispatch = await runThunk(failedMessage());

    const payloads = addOrUpdateMessagePayloads(dispatch);
    expect(payloads[0].status).toBe(MESSAGE_STATUS.PROGRESS);
    expect(payloads[1]).toEqual(
      expect.objectContaining({
        status: MESSAGE_STATUS.FAILED,
        meta: { error: 'Network unreachable' },
      }),
    );
  });
});

describe('conversationActions.sendMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends every attached file in one multipart request', async () => {
    (ConversationService.sendMessage as jest.Mock).mockResolvedValueOnce({
      id: 15,
      conversation_id: 1,
      content: 'Hello',
    });

    const dispatch = jest.fn();
    const thunk = conversationActions.sendMessage({
      conversationId: 1,
      message: 'Hello',
      private: false,
      sender: { id: 7 },
      files: [
        { uri: 'file:///tmp/a.jpg', fileName: 'a.jpg', type: 'image/jpeg' },
        { uri: 'file:///tmp/b.jpg', fileName: 'b.jpg', type: 'image/jpeg' },
      ] as unknown as File[],
    });
    await thunk(dispatch, () => ({}), undefined);

    expect(ConversationService.sendMessage).toHaveBeenCalledTimes(1);
    expect(ConversationService.sendMessage).toHaveBeenCalledWith(1, expect.any(FormData), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  });
});
