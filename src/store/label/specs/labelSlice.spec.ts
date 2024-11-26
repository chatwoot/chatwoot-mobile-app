import reducer from '../labelSlice';

describe('labelSlice', () => {
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
