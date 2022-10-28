import cannedResponsesSlice, {
  actions as cannedResponseActions,
  selectors as cannedResponseSelectors,
} from '../cannedResponseSlice';
jest.mock('axios');
const dispatch = jest.fn();
jest.mock('helpers/APIHelper', () => {
  return {
    get: jest.fn(result => {
      return Promise.resolve({
        data: [
          {
            id: 1,
            content: 'Hey :) How may I help you?',
            short_code: 'hey',
          },
        ],
      });
    }),
  };
});

describe('cannedResponses actions', () => {
  it('should create an action to set all canned responses', async () => {
    await cannedResponseActions.index()(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: 'cannedResponses/setAll',
      payload: [
        {
          content: 'Hey :) How may I help you?',
          id: 1,
          shortCode: 'hey',
        },
      ],
    });
  });
});

describe('cannedResponses reducer', () => {
  it('should return the initial state', () => {
    expect(cannedResponsesSlice(undefined, {})).toEqual({
      ids: [],
      entities: {},
    });
  });

  it('should handle setAll', () => {
    expect(
      cannedResponsesSlice(
        {
          ids: [],
          entities: {},
        },
        {
          type: 'cannedResponses/setAll',
          payload: [
            {
              content: 'Hey :) How may I help you?',
              id: 1,
              shortCode: 'hey',
            },
          ],
        },
      ),
    ).toEqual({
      ids: [1],
      entities: {
        1: {
          content: 'Hey :) How may I help you?',
          id: 1,
          shortCode: 'hey',
        },
      },
    });
  });
});

describe('cannedResponses selectors', () => {
  it('should return the filtered canned responses', () => {
    const state = {
      cannedResponses: {
        ids: [1],
        entities: {
          1: {
            content: 'Hey :) How may I help you?',
            id: 1,
            shortCode: 'hey',
          },
        },
      },
    };

    expect(cannedResponseSelectors.getFilteredCannedResponses(state, 'hey')).toEqual([
      {
        id: 1,
        content: 'Hey :) How may I help you?',
        shortCode: 'hey',
      },
    ]);
  });
});
