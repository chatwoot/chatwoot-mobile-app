import conversationLabelSlice, {
  selectConversationLabels,
  selectConversationLabelsLoading,
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

describe('conversationLabel selectors', () => {
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

describe('conversationLabel reducer', () => {
  it('should return the initial state', () => {
    expect(conversationLabelSlice(undefined, {})).toEqual({
      entities: {},
      ids: [],
      loading: false,
      records: {},
    });
  });

  it('should handle fulfilled', () => {
    expect(
      conversationLabelSlice(
        {
          records: {},
          loading: false,
        },
        {
          type: 'labels/fetchConversationLabels/fulfilled',
          payload: {
            conversationId: 1,
            labels: [{ id: 1, name: 'label1' }],
          },
        },
      ),
    ).toEqual({
      records: {
        1: [{ id: 1, name: 'label1' }],
      },
      loading: false,
    });
  });
  it('sets loading true when fetchConversationLabels is pending', () => {
    expect(
      conversationLabelSlice(
        {
          loading: false,
        },
        {
          type: 'labels/fetchConversationLabels/pending',
        },
      ),
    ).toEqual({
      loading: true,
    });
  });
  it('sets loading false when fetchConversationLabels is rejected', () => {
    expect(
      conversationLabelSlice(
        {
          loading: true,
        },
        {
          type: 'labels/fetchConversationLabels/rejected',
        },
      ),
    ).toEqual({
      loading: false,
    });
  });
});
