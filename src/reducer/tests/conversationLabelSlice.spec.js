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
    const initialState = { entities: {}, ids: [], loading: false, records: {} };

    it('sets loading true when fetchConversationLabels is pending', () => {
      const action = { type: conversationLabelActions.fetchConversationLabels.pending };
      const state = conversationLabelSlice(initialState, action);
      expect(state).toEqual({ loading: true, entities: {}, ids: [], records: {} });
    });

    it('sets loading false when fetchConversationLabels is rejected', () => {
      const action = { type: conversationLabelActions.fetchConversationLabels.rejected };
      const state = conversationLabelSlice(initialState, action);
      expect(state).toEqual({ loading: false, entities: {}, ids: [], records: {} });
    });

    it('sets labels when fetchConversationLabels is fulfilled', () => {
      const action = {
        type: conversationLabelActions.fetchConversationLabels.fulfilled,
        payload: {
          conversationId: 1,
          labels: [{ id: 1, name: 'label1' }],
        },
      };
      const state = conversationLabelSlice(initialState, action);
      expect(state).toEqual({
        loading: false,
        entities: {},
        ids: [],
        records: {
          1: [{ id: 1, name: 'label1' }],
        },
      });
    });

    it('updates labels false when updateConversationLabels is fulfilled', () => {
      const action = {
        type: conversationLabelActions.updateConversationLabels.fulfilled,
        payload: {
          conversationId: 1,
          labels: [{ id: 1, name: 'label1' }],
        },
      };
      const state = conversationLabelSlice(initialState, action);
      expect(state).toEqual({
        loading: false,
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
          loading: true,
        },
      };
      expect(selectConversationLabelsLoading(state)).toEqual(true);
    });
  });
});
