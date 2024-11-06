import {
  selectAuth,
  selectAuthHeaders,
  selectUser,
  selectIsLoggingIn,
  selectAuthError,
  selectLoggedIn,
  selectUserId,
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
