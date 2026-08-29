import reducer from '../macroSlice';

describe('macroSlice', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '' })).toEqual({
      ids: [],
      entities: {},
      isLoading: false,
    });
  });
});
