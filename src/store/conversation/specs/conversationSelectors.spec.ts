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

  describe('read_status filter', () => {
    const unread = { ...conversation, id: 1, unreadCount: 2, lastActivityAt: 3 };
    const read = { ...conversation, id: 2, unreadCount: 0, lastActivityAt: 2 };
    const unreadInOtherInbox = { ...conversation, id: 3, inboxId: 2, lastActivityAt: 1 };
    const unreadResolved = { ...conversation, id: 4, status: 'resolved' as const };
    const state = buildState({ 1: unread, 2: read, 3: unreadInOtherInbox, 4: unreadResolved });
    const ids = (filters: typeof defaultFilterState) =>
      getFilteredConversations(state, filters, userId).map(({ id }) => id);

    it('keeps read conversations by default', () => {
      expect(ids(defaultFilterState)).toEqual([1, 2, 3]);
    });

    it('keeps only conversations with unread messages', () => {
      expect(ids({ ...defaultFilterState, read_status: 'unread' })).toEqual([1, 3]);
    });

    it('combines with the status and inbox filters', () => {
      const filters = { ...defaultFilterState, read_status: 'unread' };

      expect(ids({ ...filters, inbox_id: '2' })).toEqual([3]);
      expect(ids({ ...filters, status: 'resolved' })).toEqual([4]);
      expect(ids({ ...filters, status: 'all' })).toEqual([1, 3, 4]);
    });

    it('combines with the assignee filter', () => {
      const unassignedUnread = {
        ...unread,
        id: 5,
        meta: { ...unread.meta, assignee: null },
      } as unknown as Conversation;
      const withUnassigned = buildState({ 1: unread, 2: read, 5: unassignedUnread });
      const filters = { ...defaultFilterState, read_status: 'unread', assignee_type: 'unassigned' };

      expect(getFilteredConversations(withUnassigned, filters, userId)).toEqual([unassignedUnread]);
    });
  });
});
