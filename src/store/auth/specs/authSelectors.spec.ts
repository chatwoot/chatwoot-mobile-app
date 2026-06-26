import {
  selectAuth,
  selectAuthHeaders,
  selectUser,
  selectIsLoggingIn,
  selectAuthError,
  selectLoggedIn,
  selectUserId,
  selectAccessToken,
} from '@/store/auth/authSelectors';
import { mockUser, mockHeaders } from './authMockData';
import { RootState } from '@/store';

describe('Auth Selectors', () => {
  const mockState = {
    auth: {
      user: mockUser,
      headers: mockHeaders,
      uiFlags: {
        isLoggingIn: false,
      },
      error: null,
    },
  } as unknown as RootState; // Cast mockState to RootState

  it('should select auth state', () => {
    expect(selectAuth(mockState)).toEqual(mockState.auth);
  });

  it('should select auth headers', () => {
    expect(selectAuthHeaders(mockState)).toEqual(mockHeaders);
  });

  it('should select user', () => {
    expect(selectUser(mockState)).toEqual(mockUser);
  });

  it('should select isLoggingIn flag', () => {
    expect(selectIsLoggingIn(mockState)).toBe(false);
  });

  it('should select auth error', () => {
    expect(selectAuthError(mockState)).toBeNull();
  });

  it('should select logged in status', () => {
    expect(selectLoggedIn(mockState)).toBe(true);
  });

  it('should select user id', () => {
    expect(selectUserId(mockState)).toBe(mockUser.id);
  });
});

describe('selectAccessToken', () => {
  it('returns the user access_token', () => {
    const stateWith = (user: unknown) =>
      ({ auth: { user } } as unknown as Parameters<typeof selectAccessToken>[0]);
    expect(selectAccessToken(stateWith({ access_token: 'tok_123' }))).toBe('tok_123');
  });
  it('returns undefined when there is no user', () => {
    const stateWith = (user: unknown) =>
      ({ auth: { user } } as unknown as Parameters<typeof selectAccessToken>[0]);
    expect(selectAccessToken(stateWith(null))).toBeUndefined();
  });
});
