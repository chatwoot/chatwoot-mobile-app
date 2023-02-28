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
      uiFlags: {
        loading: false,
        isTeamUpdating: false,
      },
    };

    it('sets loading true when fetch all team is pending', () => {
      const action = { type: teamActions.index.pending };
      const state = teamSlice(initialState, action);
      expect(state).toEqual({
        uiFlags: { loading: true, isTeamUpdating: false },
        entities: {},
        ids: [],
      });
    });

    it('sets loading false when fetch all team is rejected', () => {
      const action = { type: teamActions.index.rejected };
      const state = teamSlice(initialState, action);
      expect(state).toEqual({
        uiFlags: { loading: false, isTeamUpdating: false },
        entities: {},
        ids: [],
      });
    });

    it('sets teams when when fetch all team is fulfilled', () => {
      const action = {
        type: teamActions.index.fulfilled,
        payload: teams,
      };
      const state = teamSlice(initialState, action);
      expect(state).toEqual({
        uiFlags: { loading: false, isTeamUpdating: false },
        entities: {
          1: teams[0],
          2: teams[1],
        },
        ids: [1, 2],
      });
    });

    it('sets loading true when assign team is pending', () => {
      const action = { type: teamActions.update.pending };
      const state = teamSlice(initialState, action);
      expect(state).toEqual({
        uiFlags: { loading: false, isTeamUpdating: true },
        entities: {},
        ids: [],
      });
    });

    it('sets loading false when assign team is rejected', () => {
      const action = { type: teamActions.update.rejected };
      const state = teamSlice(initialState, action);
      expect(state).toEqual({
        entities: {},
        ids: [],
        uiFlags: { loading: false, isTeamUpdating: false },
      });
    });

    it('sets loading false when assign team is fulfilled', () => {
      const action = { type: teamActions.update.fulfilled };
      const state = teamSlice(initialState, action);
      expect(state).toEqual({
        entities: {},
        ids: [],
        uiFlags: { loading: false, isTeamUpdating: false },
      });
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
          uiFlags: {
            loading: true,
            isTeamUpdating: false,
          },
        },
      };
      expect(selectLoading(state)).toEqual(true);
    });

    it('selects isTeamUpdating', () => {
      const state = {
        teams: {
          uiFlags: {
            loading: false,
            isTeamUpdating: true,
          },
        },
      };
      expect(selectIsTeamUpdating(state)).toEqual(true);
    });
  });
});
