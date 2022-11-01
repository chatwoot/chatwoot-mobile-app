// import { selectors as conversationSelectors } from '../conversationSlice';
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

describe('conversation selectors', () => {
  it('should return all conversations', () => {
    // const state = {
    //   conversations: {
    //     ids: [1, 2, 3],
    //     entities: {
    //       1: {
    //         id: 1,
    //         status: 'open',
    //         meta: {
    //           assignee: {
    //             id: 1,
    //           },
    //         },
    //         inbox_id: 1,
    //       },
    //       2: {
    //         id: 2,
    //         status: 'open',
    //         meta: {
    //           assignee: {
    //             id: 2,
    //           },
    //         },
    //       },
    //       3: {
    //         id: 3,
    //         status: 'open',
    //         meta: {
    //           assignee: {
    //             id: 3,
    //           },
    //         },
    //       },
    //     },
    //   },
    // };
    // const filters = {
    //   assigneeType: 'all',
    //   status: 'all',
    //   inbox_id: 1,
    // };
    // const expected = [
    //   {
    //     id: 1,
    //     status: 'open',
    //     meta: {
    //       assignee: {
    //         id: 1,
    //       },
    //     },
    //   },
    //   {
    //     id: 2,
    //     status: 'open',
    //     meta: {
    //       assignee: {
    //         id: 2,
    //       },
    //     },
    //   },
    //   {
    //     id: 3,
    //     status: 'open',
    //     meta: {
    //       assignee: {
    //         id: 3,
    //       },
    //     },
    //   },
    // ];
    // expect(conversationSelectors.getFilteredConversations(state, filters)).toEqual(expected);
  });
});
