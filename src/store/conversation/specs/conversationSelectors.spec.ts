import type { RootState } from '@/store';
import { MESSAGE_TYPES } from '@/constants';
import type { Conversation, Message } from '@/types';
import {
  getFilteredConversations,
  getLastEmailInSelectedChat,
  selectAllConversations,
} from '../conversationSelectors';
import { defaultFilterState } from '../conversationFilterSlice';
import { conversation } from './conversationMockData';

const buildState = (entities: Record<number, Conversation | undefined>) =>
  ({
    conversations: {
      ids: Object.keys(entities).map(Number),
      entities,
    },
  }) as unknown as RootState;

describe('getFilteredConversations', () => {
  const assignedToMe = { ...conversation, id: 1 };
  const userId = assignedToMe.meta.assignee.id;

  it('skips ids without a record', () => {
    const state = buildState({ 1: assignedToMe, 2: undefined });

    expect(getFilteredConversations(state, defaultFilterState, userId)).toEqual([assignedToMe]);
  });

  it('skips records without meta', () => {
    const withoutMeta = { ...conversation, id: 3, meta: undefined } as unknown as Conversation;
    const state = buildState({ 1: assignedToMe, 3: withoutMeta });

    expect(getFilteredConversations(state, defaultFilterState, userId)).toEqual([assignedToMe]);
  });

  it('treats a record without meta as unassigned', () => {
    const withoutMeta = { ...conversation, id: 3, meta: undefined } as unknown as Conversation;
    const state = buildState({ 1: assignedToMe, 3: withoutMeta });
    const filters = { ...defaultFilterState, assignee_type: 'unassigned' };

    expect(getFilteredConversations(state, filters, userId)).toEqual([withoutMeta]);
  });

  it('leaves the memoized source array unsorted', () => {
    const older = { ...conversation, id: 1, lastActivityAt: 1 };
    const newer = { ...conversation, id: 2, lastActivityAt: 2 };
    const state = buildState({ 1: older, 2: newer });
    const source = selectAllConversations(state);

    getFilteredConversations(state, defaultFilterState, userId);

    expect(source.map(({ id }) => id)).toEqual([1, 2]);
  });
});

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
