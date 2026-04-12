import reducer from '../labelSlice';

describe('labelSlice', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'INIT' })).toEqual({
      ids: [],
      entities: {},
      isLoading: false,
    });
  });
});
