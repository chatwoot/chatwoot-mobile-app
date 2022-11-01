import { selectors as conversationSelectors } from '../conversationSlice';
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

const state = {
  conversations: {
    ids: [1, 2, 3],
    entities: {
      1: {
        id: 1,
        status: 'open',
        meta: {
          assignee: {
            id: 1,
          },
        },
        inbox_id: 1,
      },
      2: {
        id: 2,
        status: 'open',
        meta: {
          assignee: {
            id: 2,
          },
        },
        inbox_id: 1,
      },
      3: {
        id: 3,
        status: 'open',
        meta: {
          assignee: null,
        },
        inbox_id: 1,
      },
      4: {
        id: 4,
        status: 'resolved',
        meta: {
          assignee: {
            id: 1,
          },
          inbox_id: 1,
        },
      },
    },
  },
};
describe('conversation selectors', () => {
  it('should return all conversations', () => {
    const filters = {
      assigneeType: 'all',
      conversationStatus: 'open',
      inboxId: 1,
    };
    const expected = [
      {
        id: 1,
        status: 'open',
        meta: {
          assignee: {
            id: 1,
          },
        },
        inbox_id: 1,
      },
      {
        id: 2,
        status: 'open',
        meta: {
          assignee: {
            id: 2,
          },
        },
        inbox_id: 1,
      },
      {
        id: 3,
        status: 'open',
        meta: {
          assignee: null,
        },
        inbox_id: 1,
      },
    ];
    expect(conversationSelectors.getFilteredConversations(state, filters)).toEqual(expected);
  });
  it('should return mine conversations', () => {
    const filters = {
      assigneeType: 'mine',
      conversationStatus: 'all',
      inboxId: 1,
      userId: 1,
    };
    const expected = [
      {
        id: 1,
        status: 'open',
        meta: {
          assignee: {
            id: 1,
          },
        },
        inbox_id: 1,
      },
    ];
    expect(conversationSelectors.getFilteredConversations(state, filters)).toEqual(expected);
  });
  it('should return all unassigned conversations', () => {
    const filters = {
      assigneeType: 'unassigned',
      conversationStatus: 'all',
      inboxId: 1,
    };
    const expected = [
      {
        id: 3,
        status: 'open',
        meta: {
          assignee: null,
        },
        inbox_id: 1,
      },
    ];
    expect(conversationSelectors.getFilteredConversations(state, filters)).toEqual(expected);
  });
  it('should return all open conversations', () => {
    const filters = {
      assigneeType: 'all',
      conversationStatus: 'open',
      inboxId: 1,
    };
    const expected = [
      {
        id: 1,
        status: 'open',
        meta: {
          assignee: {
            id: 1,
          },
        },
        inbox_id: 1,
      },
      {
        id: 2,
        status: 'open',
        meta: {
          assignee: {
            id: 2,
          },
        },
        inbox_id: 1,
      },
      {
        id: 3,
        status: 'open',
        meta: {
          assignee: null,
        },
        inbox_id: 1,
      },
    ];
    expect(conversationSelectors.getFilteredConversations(state, filters)).toEqual(expected);
  });
  it('should return all resolved conversations', () => {
    const filters = {
      assigneeType: 'all',
      conversationStatus: 'resolved',
      inboxId: 1,
    };
    const expected = [];
    expect(conversationSelectors.getFilteredConversations(state, filters)).toEqual(expected);
  });
  it('should return all closed conversations', () => {
    const filters = {
      assigneeType: 'all',
      conversationStatus: 'closed',
      inboxId: 1,
    };
    const expected = [];
    expect(conversationSelectors.getFilteredConversations(state, filters)).toEqual(expected);
  });
  it('should return all open conversations for inbox 1', () => {
    const filters = {
      assigneeType: 'all',
      conversationStatus: 'open',
      inboxId: 1,
    };
    const expected = [
      {
        id: 1,
        status: 'open',
        meta: {
          assignee: {
            id: 1,
          },
        },
        inbox_id: 1,
      },
      {
        id: 2,
        status: 'open',
        meta: {
          assignee: {
            id: 2,
          },
        },
        inbox_id: 1,
      },
      {
        id: 3,
        status: 'open',
        meta: {
          assignee: null,
        },
        inbox_id: 1,
      },
    ];
    expect(conversationSelectors.getFilteredConversations(state, filters)).toEqual(expected);
  });
});
