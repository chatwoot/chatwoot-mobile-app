import type { RootState } from '@/store';
import type { Conversation } from '@/types';
import { getFilteredConversations, selectAllConversations } from '../conversationSelectors';
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
