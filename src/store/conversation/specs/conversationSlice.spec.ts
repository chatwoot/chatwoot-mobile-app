import conversationReducer, { addConversation, updateConversation } from '../conversationSlice';
import type { Message } from '@/types/Message';
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

  it('keeps the status guard after same-second server confirmation', () => {
    const initialConversation = {
      ...conversation,
      status: 'open' as const,
      updatedAt: 100,
    };

    const serverConfirmation = {
      ...conversation,
      status: 'resolved' as const,
      updatedAt: 100,
      labels: ['confirmed'],
    };

    const staleConversation = {
      ...conversation,
      status: 'open' as const,
      updatedAt: 100,
      labels: ['stale'],
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

    state = conversationReducer(state, updateConversation(serverConfirmation));

    expect(state.entities[conversation.id]?.status).toBe('resolved');
    expect(state.entities[conversation.id]?.localStatusUpdatedAt).toBe(100);
    expect(state.entities[conversation.id]?.localStatusPreviousStatus).toBe('open');
    expect(state.entities[conversation.id]?.labels).toEqual(['confirmed']);

    state = conversationReducer(state, updateConversation(staleConversation));

    expect(state.entities[conversation.id]?.status).toBe('resolved');
    expect(state.entities[conversation.id]?.localStatusUpdatedAt).toBe(100);
    expect(state.entities[conversation.id]?.localStatusPreviousStatus).toBe('open');
    expect(state.entities[conversation.id]?.labels).toEqual(['stale']);
  });

  it('accepts equal-timestamp status updates that are not stale pre-toggle echoes', () => {
    const initialConversation = {
      ...conversation,
      status: 'open' as const,
      updatedAt: 100,
    };

    const serverConversation = {
      ...conversation,
      status: 'pending' as const,
      updatedAt: 100,
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

    state = conversationReducer(state, updateConversation(serverConversation));

    expect(state.entities[conversation.id]?.status).toBe('pending');
    expect(state.entities[conversation.id]?.updatedAt).toBe(100);
    expect(state.entities[conversation.id]?.localStatusUpdatedAt).toBe(100);
    expect(state.entities[conversation.id]?.localStatusPreviousStatus).toBe('open');
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
    expect(state.entities[conversation.id]?.localStatusUpdatedAt).toBeUndefined();
    expect(state.entities[conversation.id]?.localStatusPreviousStatus).toBeUndefined();
  });

  it('does not let client-clock local markers block server status updates', () => {
    const initialConversation = {
      ...conversation,
      status: 'resolved' as const,
      updatedAt: 100,
      localStatusUpdatedAt: Date.now(),
    };

    const serverConversation = {
      ...conversation,
      status: 'open' as const,
      updatedAt: 101,
    };

    let state = conversationReducer(undefined, addConversation(initialConversation));
    state = conversationReducer(state, updateConversation(serverConversation));

    expect(state.entities[conversation.id]?.status).toBe('open');
    expect(state.entities[conversation.id]?.updatedAt).toBe(101);
    expect(state.entities[conversation.id]?.localStatusUpdatedAt).toBeUndefined();
    expect(state.entities[conversation.id]?.localStatusPreviousStatus).toBeUndefined();
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

describe('fetchPreviousMessages first load', () => {
  const message = (id: number, content: string, contentType = 'text') =>
    ({ id, content, contentType, createdAt: id * 100 }) as unknown as Message;

  const load = (held: Message[], fetched: Message[]) => {
    let state = conversationReducer(
      undefined,
      addConversation({ ...conversation, messages: held }),
    );
    state = conversationReducer(
      state,
      conversationActions.fetchPreviousMessages.fulfilled(
        { messages: fetched, conversationId: conversation.id, meta: {} } as never,
        'request-id',
        { conversationId: conversation.id } as never,
      ),
    );
    return state.entities[conversation.id]?.messages ?? [];
  };

  it('prepends only unseen messages and keeps the held order', () => {
    const messages = load(
      [message(3, 'held three'), message(4, 'held four')],
      [message(1, 'one'), message(3, 'fetched three')],
    );

    expect(messages.map(m => m.id)).toEqual([1, 3, 4]);
    expect(messages[1].content).toBe('held three');
  });

  it('takes the fetched copy of a call message whose status moved on', () => {
    const messages = load(
      [message(5, 'ringing', 'voice_call')],
      [message(5, 'ended', 'voice_call')],
    );

    expect(messages.map(m => m.content)).toEqual(['ended']);
  });
});
