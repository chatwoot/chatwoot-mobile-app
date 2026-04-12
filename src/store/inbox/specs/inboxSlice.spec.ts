import reducer from '../inboxSlice';

describe('inbox reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'INIT' })).toEqual({
      ids: [],
      entities: {},
      isLoading: false,
    });
  });
});
