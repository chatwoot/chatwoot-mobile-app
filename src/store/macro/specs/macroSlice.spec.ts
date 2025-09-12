import reducer from '../macroSlice';

describe('macroSlice', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual({
      ids: [],
      entities: {},
      isLoading: false,
    });
  });
});
