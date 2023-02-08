import teamSlice, {
  teamSelector,
  selectIsTeamUpdating,
  selectLoading,
  actions as teamActions,
} from '../teamSlice';

const teams = [
  {
    id: 1,
    name: '💰 sales',
    description: 'Sales team',
    account_id: 1,
  },
  {
    id: 2,
    name: '👩‍💻 engineering',
    description: 'Engineering team',
    account_id: 1,
  },
];

jest.mock('axios');

jest.mock('helpers/APIHelper', () => {
  return {
    get: jest.fn(result => {
      return Promise.resolve({
        data: {
          payload: teams,
        },
      });
    }),
  };
});

describe('teamSlice', () => {
  describe('reducers', () => {
    const initialState = {
      entities: {},
      ids: [],
      loading: false,
    };

    it('sets loading true when fetchAllTeams is pending', () => {
      const action = { type: teamActions.fetchAllTeams.pending };
      const state = teamSlice(initialState, action);
      expect(state).toEqual({ loading: true, entities: {}, ids: [] });
    });

    it('sets loading false when fetchAllTeams is rejected', () => {
      const action = { type: teamActions.fetchAllTeams.rejected };
      const state = teamSlice(initialState, action);
      expect(state).toEqual({ loading: false, entities: {}, ids: [] });
    });

    it('sets teams when fetchAllTeams is fulfilled', () => {
      const action = {
        type: teamActions.fetchAllTeams.fulfilled,
        payload: teams,
      };
      const state = teamSlice(initialState, action);
      expect(state).toEqual({
        loading: false,
        entities: {
          1: teams[0],
          2: teams[1],
        },
        ids: [1, 2],
      });
    });

    it('sets loading true when assignTeam is pending', () => {
      const action = { type: teamActions.assignTeam.pending };
      const state = teamSlice(initialState, action);
      expect(state).toEqual({ loading: false, entities: {}, ids: [], isTeamUpdating: true });
    });

    it('sets loading false when assignTeam is rejected', () => {
      const action = { type: teamActions.assignTeam.rejected };
      const state = teamSlice(initialState, action);
      expect(state).toEqual({ loading: false, entities: {}, ids: [], isTeamUpdating: false });
    });

    it('sets loading false when assignTeam is fulfilled', () => {
      const action = { type: teamActions.assignTeam.fulfilled };
      const state = teamSlice(initialState, action);
      expect(state).toEqual({ loading: false, entities: {}, ids: [], isTeamUpdating: false });
    });
  });

  describe('selectors', () => {
    it('selects teams', () => {
      const state = {
        teams: {
          entities: {
            1: teams[0],
            2: teams[1],
          },
          ids: [1, 2],
        },
      };
      expect(teamSelector.selectAll(state)).toEqual(teams);
    });

    it('selects loading', () => {
      const state = {
        teams: {
          loading: true,
        },
      };
      expect(selectLoading(state)).toEqual(true);
    });

    it('selects isTeamUpdating', () => {
      const state = {
        teams: {
          isTeamUpdating: true,
        },
      };
      expect(selectIsTeamUpdating(state)).toEqual(true);
    });
  });
});
