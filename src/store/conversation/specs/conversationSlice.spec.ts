import conversationReducer, { addConversation, updateConversation } from '../conversationSlice';
import { conversation } from './conversationMockData';
import { conversationActions } from '../conversationActions';

describe('conversation reducer', () => {
  it('ignores outdated conversation updates', () => {
    const initialConversation = {
      ...conversation,
      status: 'resolved' as const,
      updatedAt: 200,
    };

    const outdatedConversation = {
      ...conversation,
      status: 'open' as const,
      updatedAt: 100,
    };

    let state = conversationReducer(undefined, addConversation(initialConversation));
    state = conversationReducer(state, updateConversation(outdatedConversation));

    expect(state.entities[conversation.id]?.status).toBe('resolved');
    expect(state.entities[conversation.id]?.updatedAt).toBe(200);
  });

  it('keeps resolved status while merging same-second updates after status toggle', () => {
    const initialConversation = {
      ...conversation,
      status: 'open' as const,
      updatedAt: 100,
    };

    const staleConversation = {
      ...conversation,
      status: 'open' as const,
      updatedAt: 100,
      labels: ['billing'],
      priority: 'high' as const,
    };

    let state = conversationReducer(undefined, addConversation(initialConversation));
    state = conversationReducer(
      state,
      conversationActions.toggleConversationStatus.fulfilled(
        {
          conversationId: conversation.id,
          currentStatus: 'resolved',
          snoozedUntil: null,
        },
        'request-id',
        {
          conversationId: conversation.id,
          payload: { status: 'resolved', snoozed_until: null },
        },
      ),
    );
    state = conversationReducer(state, updateConversation(staleConversation));

    expect(state.entities[conversation.id]?.status).toBe('resolved');
    expect(state.entities[conversation.id]?.updatedAt).toBe(100);
    expect(state.entities[conversation.id]?.localStatusUpdatedAt).toBe(100);
    expect(state.entities[conversation.id]?.labels).toEqual(['billing']);
    expect(state.entities[conversation.id]?.priority).toBe('high');
  });

  it('accepts newer server status updates after a local status toggle', () => {
    const initialConversation = {
      ...conversation,
      status: 'open' as const,
      updatedAt: 100,
    };

    const newerConversation = {
      ...conversation,
      status: 'open' as const,
      updatedAt: 201,
    };

    let state = conversationReducer(undefined, addConversation(initialConversation));
    state = conversationReducer(
      state,
      conversationActions.toggleConversationStatus.fulfilled(
        {
          conversationId: conversation.id,
          currentStatus: 'resolved',
          snoozedUntil: null,
        },
        'request-id',
        {
          conversationId: conversation.id,
          payload: { status: 'resolved', snoozed_until: null },
        },
      ),
    );
    state = conversationReducer(state, updateConversation(newerConversation));

    expect(state.entities[conversation.id]?.status).toBe('open');
    expect(state.entities[conversation.id]?.updatedAt).toBe(201);
  });

  it('ignores outdated conversations from list fetches', () => {
    const initialConversation = {
      ...conversation,
      status: 'resolved' as const,
      updatedAt: 200,
    };

    const staleConversation = {
      ...conversation,
      status: 'open' as const,
      updatedAt: 100,
    };

    let state = conversationReducer(undefined, addConversation(initialConversation));
    state = conversationReducer(
      state,
      conversationActions.fetchConversations.fulfilled(
        {
          conversations: [staleConversation],
          meta: {
            mineCount: 1,
            unassignedCount: 1,
            allCount: 1,
          },
        },
        'request-id',
        {
          status: 'open',
          assigneeType: 'all',
          page: 1,
          sortBy: 'latest',
        },
      ),
    );

    expect(state.entities[conversation.id]?.status).toBe('resolved');
    expect(state.entities[conversation.id]?.updatedAt).toBe(200);
  });
});
