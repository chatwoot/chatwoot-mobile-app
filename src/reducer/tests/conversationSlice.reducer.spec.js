import conversationSlice from '../conversationSlice';
import conversationMockData from './conversationMockData';
const { conversations, meta } = conversationMockData;
jest.mock('axios');
jest.mock('helpers/APIHelper', () => {
  return {
    get: jest.fn(result => {
      return Promise.resolve({
        data: [],
      });
    }),
  };
});

describe('conversations reducer', () => {
  it('should return the initial state', () => {
    expect(conversationSlice(undefined, {})).toEqual({
      ids: [],
      entities: {},
      loading: false,
      meta: {
        mine_count: 0,
        unassigned_count: 0,
        all_count: 0,
      },
      isAllConversationsFetched: false,
      isAllMessagesFetched: false,
      conversationStatus: 'open',
      assigneeType: 'mine',
      currentInbox: 0,
      loadingMessages: false,
    });
  });
  it('sets loading true when fetchConversations is pending', () => {
    expect(
      conversationSlice(
        {
          loading: false,
        },
        {
          type: 'conversations/fetchConversations/pending',
        },
      ),
    ).toEqual({
      loading: true,
    });
  });
  it('sets conversations when fetchConversations is fulfilled', () => {
    expect(
      conversationSlice(
        {
          loading: true,
          ids: [],
          entities: {},
        },
        {
          type: 'conversations/fetchConversations/fulfilled',
          payload: {
            conversations,
            meta,
          },
        },
      ),
    ).toEqual({
      loading: false,
      ids: [conversations[0].id],
      entities: {
        1: conversations[0],
      },
      meta: {
        mine_count: 1,
        unassigned_count: 0,
        all_count: 1,
      },
      isAllConversationsFetched: true,
    });
  });
  it('upsert conversations when fetchConversations is fulfilled', () => {
    expect(
      conversationSlice(
        {
          loading: true,
          ids: [conversations[0].id],
          entities: {
            1: {
              ...conversations[0],
              status: 'all',
            },
          },
        },
        {
          type: 'conversations/fetchConversations/fulfilled',
          payload: {
            conversations,
            meta,
          },
        },
      ),
    ).toEqual({
      loading: false,
      ids: [conversations[0].id],
      entities: {
        1: conversations[0],
      },
      meta: {
        mine_count: 1,
        unassigned_count: 0,
        all_count: 1,
      },
      isAllConversationsFetched: true,
    });
  });
  it('sets loading false when fetchConversations is rejected', () => {
    expect(
      conversationSlice(
        {
          loading: true,
        },
        {
          type: 'conversations/fetchConversations/rejected',
        },
      ),
    ).toEqual({
      loading: false,
    });
  });
});
