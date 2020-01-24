import reducer, { initialState } from '../auth';
import { LOGIN } from '../../constants/actions';

describe('Auth reducer', () => {
  it('should return initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should handle LOGIN', () => {
    expect(
      reducer(undefined, {
        type: LOGIN,
      }),
    ).toEqual({
      ...initialState,
      isLoggingIn: true,
    });
  });
});
