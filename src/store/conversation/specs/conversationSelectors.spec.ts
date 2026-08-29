import { getLastEmailInSelectedChat } from '../conversationSelectors';
import { RootState } from '@/store';
import { MESSAGE_TYPES } from '@/constants';
import type { Conversation, Message } from '@/types';
import { conversation } from './conversationMockData';

const buildMessage = (overrides: Partial<Message>): Message =>
  ({
    ...conversation.lastNonActivityMessage,
    ...overrides,
  }) as Message;

const stateWithMessages = (messages: Message[]): RootState =>
  ({
    conversations: {
      ids: [conversation.id],
      entities: {
        [conversation.id]: { ...conversation, messages } as Conversation,
      },
    },
  }) as unknown as RootState;

describe('getLastEmailInSelectedChat', () => {
  const params = { conversationId: conversation.id };

  it('returns undefined when the conversation is not in the store', () => {
    const emptyState = { conversations: { ids: [], entities: {} } } as unknown as RootState;

    expect(getLastEmailInSelectedChat(emptyState, { conversationId: 999 })).toBeUndefined();
  });

  it('returns undefined when no message carries email attributes', () => {
    const messages = [
      buildMessage({ id: 1, messageType: MESSAGE_TYPES.INCOMING, contentAttributes: null }),
      buildMessage({ id: 2, messageType: MESSAGE_TYPES.OUTGOING, contentAttributes: null }),
    ];

    expect(getLastEmailInSelectedChat(stateWithMessages(messages), params)).toBeUndefined();
  });

  it('returns the most recent incoming or outgoing message that has email.from', () => {
    const older = buildMessage({
      id: 1,
      messageType: MESSAGE_TYPES.INCOMING,
      contentAttributes: { email: { subject: 'first', from: ['a@example.test'] } },
    } as Partial<Message>);
    const newer = buildMessage({
      id: 2,
      messageType: MESSAGE_TYPES.OUTGOING,
      contentAttributes: { email: { subject: 'second', from: ['b@example.test'] } },
    } as Partial<Message>);

    const result = getLastEmailInSelectedChat(stateWithMessages([older, newer]), params);

    expect(result?.id).toBe(2);
  });

  it('ignores activity messages even when they carry email attributes', () => {
    const activity = buildMessage({
      id: 3,
      messageType: MESSAGE_TYPES.ACTIVITY,
      contentAttributes: { email: { subject: 'activity', from: ['c@example.test'] } },
    } as Partial<Message>);

    expect(getLastEmailInSelectedChat(stateWithMessages([activity]), params)).toBeUndefined();
  });
});
