import labelSlice, {
  labelsSelector,
  selectLabelLoading,
  actions as labelActions,
} from '../labelSlice';

const labels = [
  {
    id: 1,
    color: '#DF4CAB',
    description: 'Questions about integrations',
    show_on_sidebar: true,
    title: 'integrations',
  },
  {
    id: 2,
    color: '#FF1F52',
    description: 'General feedback',
    show_on_sidebar: true,
    title: 'feedback',
  },
];
jest.mock('axios');

jest.mock('helpers/APIHelper', () => {
  return {
    get: jest.fn(result => {
      return Promise.resolve({
        data: {
          payload: labels,
        },
      });
    }),
  };
});

describe('labelSlice', () => {
  describe('reducers', () => {
    const initialState = {
      entities: {},
      ids: [],
      uiFlags: {
        loading: false,
      },
    };

    it('sets loading true when fetch all labels is pending', () => {
      const action = { type: labelActions.index.pending };
      const state = labelSlice(initialState, action);
      expect(state).toEqual({ uiFlags: { loading: true }, entities: {}, ids: [] });
    });

    it('sets loading false when fetch all labels is rejected', () => {
      const action = { type: labelActions.index.rejected };
      const state = labelSlice(initialState, action);
      expect(state).toEqual({ uiFlags: { loading: false }, entities: {}, ids: [] });
    });

    it('sets labels when fetch all labels is fulfilled', () => {
      const action = {
        type: labelActions.index.fulfilled,
        payload: labels,
      };
      const state = labelSlice(initialState, action);
      expect(state).toEqual({
        uiFlags: { loading: false },
        entities: {
          1: labels[0],
          2: labels[1],
        },
        ids: [1, 2],
      });
    });
  });

  describe('selectors', () => {
    const state = {
      labels: {
        entities: {
          1: labels[0],
          2: labels[1],
        },
        ids: [1, 2],
        uiFlags: { loading: false },
      },
    };

    it('returns labels', () => {
      expect(labelsSelector.selectAll(state)).toEqual(labels);
    });

    it('returns loading', () => {
      expect(selectLabelLoading(state)).toEqual(false);
    });
  });
});
