import conversationWatchersSlice, {
  selectConversationWatchers,
  selectConversationWatchersLoading,
  actions as conversationWatchersActions,
} from '../conversationWatchersSlice';

jest.mock('axios');

jest.mock('helpers/APIHelper', () => {
  return {
    get: jest.fn(result => {
      return Promise.resolve({
        data: {
          payload: [
            {
              id: 50,
              account_id: 3,
              availability_status: 'offline',
              auto_offline: true,
              confirmed: true,
              email: '',
              available_name: 'John Doe',
              name: 'John Doe',
              role: 'administrator',
              thumbnail: '',
            },
          ],
        },
      });
    }),
  };
});

describe('conversationWatchersSlice', () => {
  describe('reducers', () => {
    const initialState = { entities: {}, ids: [], uiFlags: { loading: false }, records: {} };

    it('sets loading true when fetch conversation watcher is pending', () => {
      const action = { type: conversationWatchersActions.show.pending };
      const state = conversationWatchersSlice(initialState, action);
      expect(state.uiFlags.loading).toEqual(true);
    });

    it('sets loading false when fetch conversation watcher is fulfilled', () => {
      const watchersList = [
        {
          id: 50,
          account_id: 3,
          availability_status: 'offline',
          auto_offline: true,
          confirmed: true,
          email: '',
          available_name: 'John Doe',
          name: 'John Doe',
          role: 'administrator',
          thumbnail: '',
        },
      ];
      const action = {
        type: conversationWatchersActions.show.fulfilled,
        payload: {
          watchersList: watchersList,
          conversationId: 1,
        },
      };
      const state = conversationWatchersSlice(initialState, action);
      expect(state).toEqual({
        uiFlags: { loading: false },
        entities: {},
        ids: [],
        records: {
          1: watchersList,
        },
      });
    });

    it('sets loading false when fetch conversation watcher is rejected', () => {
      const action = { type: conversationWatchersActions.show.rejected };
      const state = conversationWatchersSlice(initialState, action);
      expect(state.uiFlags.loading).toEqual(false);
    });

    it('updates conversation watcher', () => {
      const watchersList = [
        {
          id: 50,
          account_id: 3,
          availability_status: 'offline',
          auto_offline: true,
          confirmed: true,
          email: '',
          available_name: 'John Doe',
          name: 'John Doe',
          role: 'administrator',
          thumbnail: '',
        },
      ];
      const action = {
        type: conversationWatchersActions.update.fulfilled,
        payload: {
          watchersList: watchersList,
          conversationId: 1,
        },
      };
      const state = conversationWatchersSlice(initialState, action);
      expect(state).toEqual({
        uiFlags: { loading: false },
        entities: {},
        ids: [],
        records: {
          1: watchersList,
        },
      });
    });
  });

  describe('selectors', () => {
    it('should return conversation watcher', () => {
      const watchersList = [
        {
          id: 50,
          account_id: 3,
          availability_status: 'offline',
          auto_offline: true,
          confirmed: true,
          email: '',
          available_name: 'John Doe',
          name: 'John Doe',
          role: 'administrator',
          thumbnail: '',
        },
      ];

      const state = {
        conversationWatchers: {
          uiFlags: { loading: false },
          entities: {},
          ids: [],
          records: {
            1: watchersList,
          },
        },
      };
      expect(selectConversationWatchers(state)).toEqual({
        1: watchersList,
      });
    });

    it('should return conversation watcher loading', () => {
      const state = {
        conversationWatchers: {
          uiFlags: { loading: true },
          entities: {},
          ids: [],
          records: {},
        },
      };
      expect(selectConversationWatchersLoading(state)).toEqual(true);
    });
  });
});
