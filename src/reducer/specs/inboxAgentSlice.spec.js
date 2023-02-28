import inboxAgentsSlice, {
  actions as inboxAgentActions,
  inboxAgentSelector,
  inboxAgentSelectors,
  selectInboxFetching,
  updateAgentsPresence,
} from '../inboxAgentsSlice';

const inboxAgents = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@gmail.com',
    avatar_url: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50',
    role: 'admin',
    confirmed: true,
    availability_status: 'online',
  },
];

jest.mock('axios');

jest.mock('helpers/APIHelper', () => {
  return {
    get: jest.fn(result => {
      return Promise.resolve({
        data: {
          payload: inboxAgents,
        },
      });
    }),
  };
});

describe('inboxAgentsSlice', () => {
  describe('reducers', () => {
    const initialState = {
      entities: {},
      ids: [],
      isFetching: false,
    };

    it('sets isFetching true when fetchInboxAgents is pending', () => {
      const action = { type: inboxAgentActions.fetchInboxAgents.pending };
      const state = inboxAgentsSlice(initialState, action);
      expect(state).toEqual({ isFetching: true, entities: {}, ids: [] });
    });

    it('sets isFetching false when fetchInboxAgents is rejected', () => {
      const action = { type: inboxAgentActions.fetchInboxAgents.rejected };
      const state = inboxAgentsSlice(initialState, action);
      expect(state).toEqual({ isFetching: false, entities: {}, ids: [] });
    });

    it('sets agents false when fetchInboxAgents is fulfilled', () => {
      const action = {
        type: inboxAgentActions.fetchInboxAgents.fulfilled,
        payload: inboxAgents,
      };
      const state = inboxAgentsSlice(initialState, action);
      expect(state).toEqual({
        isFetching: false,
        entities: {
          1: {
            id: 1,
            name: 'John Doe',
            email: 'john@gmail.com',
            avatar_url: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50',
            role: 'admin',
            confirmed: true,
            availability_status: 'online',
          },
        },
        ids: [1],
      });
    });

    it('updates agents presence', () => {
      const state = {
        entities: {
          1: {
            id: 1,
            name: 'John Doe',
            email: 'john@gmail.com',
            avatar_url: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50',
            role: 'admin',
            confirmed: true,
            availability_status: 'offline',
          },
        },
        ids: [1],
      };

      expect(inboxAgentsSlice(state, updateAgentsPresence({ users: { 1: 'online' } }))).toEqual({
        entities: {
          1: {
            id: 1,
            name: 'John Doe',
            email: 'john@gmail.com',
            avatar_url: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50',
            role: 'admin',
            confirmed: true,
            availability_status: 'online',
          },
        },
        ids: [1],
      });
    });
  });

  describe('selectors', () => {
    const state = {
      inboxAgents: {
        isFetching: false,
        entities: {
          1: {
            id: 1,
            name: 'John Doe',
            email: 'john@gmail.com',
            avatar_url: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50',

            role: 'admin',
            confirmed: true,
            availability_status: 'online',
          },
        },
        ids: [1],
      },
    };

    it('selects inboxAgents', () => {
      expect(inboxAgentSelector.selectAll(state)).toEqual(inboxAgents);
    });

    it('selectInboxFetching', () => {
      expect(selectInboxFetching(state)).toEqual(false);
    });

    it('selects inboxAssignedAgents', () => {
      expect(inboxAgentSelectors.inboxAssignedAgents(state)).toEqual(inboxAgents);
    });
  });
});
