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
      loading: false,
    };

    it('sets loading true when fetchAllLabels is pending', () => {
      const action = { type: labelActions.fetchAllLabels.pending };
      const state = labelSlice(initialState, action);
      expect(state).toEqual({ loading: true, entities: {}, ids: [] });
    });

    it('sets loading false when fetchAllLabels is rejected', () => {
      const action = { type: labelActions.fetchAllLabels.rejected };
      const state = labelSlice(initialState, action);
      expect(state).toEqual({ loading: false, entities: {}, ids: [] });
    });

    it('sets labels when fetchAllLabels is fulfilled', () => {
      const action = {
        type: labelActions.fetchAllLabels.fulfilled,
        payload: labels,
      };
      const state = labelSlice(initialState, action);
      expect(state).toEqual({
        loading: false,
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
        loading: false,
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
