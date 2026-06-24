import reducer from '../companySlice';

describe('company reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual({
      entities: {},
      notesByCompanyId: {},
      contactsByCompanyId: {},
      isLoading: false,
    });
  });
});
