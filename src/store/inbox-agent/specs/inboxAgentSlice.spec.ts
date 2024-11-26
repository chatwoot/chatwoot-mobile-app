import reducer from '../inboxAgentSlice';

describe('inboxAgentSlice', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual({
      ids: [],
      entities: {},
      uiFlags: {
        isLoading: false,
      },
    });
  });
});
