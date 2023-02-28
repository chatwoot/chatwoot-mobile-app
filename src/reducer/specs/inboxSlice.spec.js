import inboxSlice, { actions as inboxActions, inboxesSelector } from '../inboxSlice';

const inboxes = [
  {
    id: 0,
    name: 'All',
    channel_type: 'Channel::All',
  },
  {
    id: 1,
    name: 'Email',
    channel_type: 'Channel::Email',
  },
];
jest.mock('axios');
jest.mock('helpers/APIHelper', () => {
  return {
    get: jest.fn(result => {
      return Promise.resolve({
        data: {
          payload: inboxes,
        },
      });
    }),
  };
});

describe('inboxSlice', () => {
  describe('reducers', () => {
    const initialState = {
      entities: {},
      ids: [],
      loading: false,
    };

    it('sets loading true when fetchInboxes is pending', () => {
      const action = { type: inboxActions.fetchInboxes.pending };
      const state = inboxSlice(initialState, action);
      expect(state).toEqual({ loading: true, entities: {}, ids: [] });
    });

    it('sets loading false when fetchInboxes is rejected', () => {
      const action = { type: inboxActions.fetchInboxes.rejected };
      const state = inboxSlice(initialState, action);
      expect(state).toEqual({ loading: false, entities: {}, ids: [] });
    });

    it('sets loading false when fetchInboxes is fulfilled', () => {
      const action = {
        type: inboxActions.fetchInboxes.fulfilled,
        payload: inboxes,
      };
      const state = inboxSlice(initialState, action);
      expect(state).toEqual({
        loading: false,
        entities: {
          0: inboxes[0],
          1: inboxes[1],
        },
        ids: [0, 1],
      });
    });
  });

  describe('selectors', () => {
    const state = {
      inboxes: {
        entities: {
          0: inboxes[0],
          1: inboxes[1],
        },
        ids: [0, 1],
        loading: false,
      },
    };

    it('returns all inboxes', () => {
      expect(inboxesSelector.selectAll(state)).toEqual(inboxes);
    });
  });
});
