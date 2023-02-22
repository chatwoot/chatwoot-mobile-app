import conversationLabelSlice, {
  selectConversationLabels,
  selectConversationLabelsLoading,
  actions as conversationLabelActions,
} from '../conversationLabelSlice';

jest.mock('axios');

jest.mock('helpers/APIHelper', () => {
  return {
    get: jest.fn(result => {
      return Promise.resolve({
        data: {
          payload: ['integrations', 'cloud'],
        },
      });
    }),
  };
});

describe('conversationLabelSlice', () => {
  describe('reducers', () => {
    const initialState = { entities: {}, ids: [], uiFlags: { loading: false }, records: {} };

    it('sets loading true when fetch conversation labels is pending', () => {
      const action = { type: conversationLabelActions.index.pending };
      const state = conversationLabelSlice(initialState, action);
      expect(state).toEqual({ uiFlags: { loading: true }, entities: {}, ids: [], records: {} });
    });

    it('sets loading false when fetch conversation labels is rejected', () => {
      const action = { type: conversationLabelActions.index.rejected };
      const state = conversationLabelSlice(initialState, action);
      expect(state).toEqual({ uiFlags: { loading: false }, entities: {}, ids: [], records: {} });
    });

    it('sets labels when fetch conversation labels is fulfilled', () => {
      const action = {
        type: conversationLabelActions.index.fulfilled,
        payload: {
          conversationId: 1,
          labels: [{ id: 1, name: 'label1' }],
        },
      };
      const state = conversationLabelSlice(initialState, action);
      expect(state).toEqual({
        uiFlags: { loading: false },
        entities: {},
        ids: [],
        records: {
          1: [{ id: 1, name: 'label1' }],
        },
      });
    });

    it('updates labels false when update conversation labels is fulfilled', () => {
      const action = {
        type: conversationLabelActions.update.fulfilled,
        payload: {
          conversationId: 1,
          labels: [{ id: 1, name: 'label1' }],
        },
      };
      const state = conversationLabelSlice(initialState, action);
      expect(state).toEqual({
        uiFlags: { loading: false },
        entities: {},
        ids: [],
        records: {
          1: [{ id: 1, name: 'label1' }],
        },
      });
    });
  });
  describe('selectors', () => {
    it('should return conversation labels', () => {
      const state = {
        conversationLabels: {
          records: {
            1: [{ id: 1, name: 'label1' }],
          },
        },
      };
      expect(selectConversationLabels(state)).toEqual({ 1: [{ id: 1, name: 'label1' }] });
    });

    it('should return conversation labels loading', () => {
      const state = {
        conversationLabels: {
          uiFlags: {
            loading: true,
          },
        },
      };
      expect(selectConversationLabelsLoading(state)).toEqual(true);
    });
  });
});
