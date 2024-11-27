import reducer from '../assignableAgentSlice';

describe('assignableAgentSlice', () => {
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
