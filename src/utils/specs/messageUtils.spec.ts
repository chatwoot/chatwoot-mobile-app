import {
  canRetryMessage,
  createPendingMessage,
  hasMessageFailedWithExternalError,
} from '@/utils/messageUtils';
import { MESSAGE_STATUS, MESSAGE_TYPES, SENDER_TYPES } from '@/constants';
import type { SendMessagePayload } from '@/store/conversation/conversationTypes';
import type { Message } from '@/types';

const NOW = new Date(Date.UTC(2026, 0, 10, 12, 0, 0));
const toUnix = (date: Date) => Math.floor(date.valueOf() / 1000);

const buildMessage = (overrides: Partial<Message> = {}): Message =>
  ({
    id: 1,
    content: 'Hello',
    attachments: [],
    createdAt: toUnix(NOW),
    status: MESSAGE_STATUS.FAILED,
    contentAttributes: null,
    ...overrides,
  }) as unknown as Message;

describe('createPendingMessage', () => {
  it('stamps the sender so the message stays attributed once it leaves the progress state', () => {
    const pendingMessage = createPendingMessage({
      conversationId: 1,
      message: 'Hello',
      private: false,
      sender: { id: 7, thumbnail: '' },
    } as SendMessagePayload);

    expect(pendingMessage.senderId).toBe(7);
    expect(pendingMessage.senderType).toBe(SENDER_TYPES.USER);
    expect(pendingMessage.messageType).toBe(MESSAGE_TYPES.OUTGOING);
  });
});

describe('hasMessageFailedWithExternalError', () => {
  it('returns true when a failed message carries an external error', () => {
    const message = buildMessage({
      contentAttributes: { externalError: 'Recipient blocked the account' },
    } as Partial<Message>);
    expect(hasMessageFailedWithExternalError(message)).toBe(true);
  });

  it('returns false when a failed message has no external error', () => {
    expect(hasMessageFailedWithExternalError(buildMessage())).toBe(false);
    expect(
      hasMessageFailedWithExternalError(
        buildMessage({ contentAttributes: { externalError: '' } } as Partial<Message>),
      ),
    ).toBe(false);
  });

  it('returns false when the message has not failed', () => {
    const message = buildMessage({
      status: MESSAGE_STATUS.SENT,
      contentAttributes: { externalError: 'Recipient blocked the account' },
    } as Partial<Message>);
    expect(hasMessageFailedWithExternalError(message)).toBe(false);
  });
});

describe('canRetryMessage', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('allows retrying a recent failed message with content', () => {
    expect(canRetryMessage(buildMessage())).toBe(true);
  });

  it('allows retrying a recent failed message with only attachments', () => {
    const message = buildMessage({
      content: '',
      attachments: [{ id: 12 }],
    } as unknown as Partial<Message>);
    expect(canRetryMessage(message)).toBe(true);
  });

  it('does not allow retrying a message older than a day', () => {
    const twoDaysAgo = new Date(NOW.valueOf() - 2 * 24 * 60 * 60 * 1000);
    expect(canRetryMessage(buildMessage({ createdAt: toUnix(twoDaysAgo) }))).toBe(false);
  });

  it('does not allow retrying a message without content or attachments', () => {
    expect(canRetryMessage(buildMessage({ content: '', attachments: [] }))).toBe(false);
  });

  it('does not allow retrying a public message once the reply window has closed', () => {
    // The window is measured from the contact's last message, so a recent failure can fall outside
    // it and would be rejected by the channel on a resend
    expect(canRetryMessage(buildMessage({ private: false } as Partial<Message>), false)).toBe(
      false,
    );
  });

  it('allows retrying a private note regardless of the reply window', () => {
    // A note never leaves the dashboard, so the window does not apply
    expect(canRetryMessage(buildMessage({ private: true } as Partial<Message>), false)).toBe(true);
  });

  it('allows retrying a public message while the reply window is open', () => {
    expect(canRetryMessage(buildMessage({ private: false } as Partial<Message>), true)).toBe(true);
  });

  it('does not allow retrying a message that has not failed', () => {
    expect(canRetryMessage(buildMessage({ status: MESSAGE_STATUS.SENT } as Partial<Message>))).toBe(
      false,
    );
  });
});
