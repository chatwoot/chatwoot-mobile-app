import reducer from '../inboxSlice';

describe('inbox reducer', () => {
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
