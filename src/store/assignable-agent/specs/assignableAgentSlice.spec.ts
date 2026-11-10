import reducer from '../assignableAgentSlice';

describe('assignableAgentSlice', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '' })).toEqual({
      records: {},
      uiFlags: {
        isLoading: false,
      },
    });
  });
});
