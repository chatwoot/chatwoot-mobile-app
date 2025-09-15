import authReducer, { logout, resetAuth, setAccount } from '@/store/auth/authSlice';
import { mockUser } from './authMockData';
import { AuthState } from '@/store/auth/authSlice';
import { authActions } from '@/store/auth/authActions';
import { AvailabilityStatus, UserRole } from '@/types';

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

jest.mock('@/i18n', () => ({
  t: (key: string) => key,
}));

jest.mock('@/utils/toastUtils', () => ({
  showToast: jest.fn(),
}));

jest.mock('@/services/APIService', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Auth Slice', () => {
  const initialState: AuthState = {
    user: null,
    accessToken: null,
    uiFlags: {
      isLoggingIn: false,
      isResettingPassword: false,
      isVerifyingMfa: false,
    },
    headers: null,
    error: null,
    mfaToken: null,
  };

  const loggedInState = {
    ...initialState,
    user: {
      ...mockUser,
      accounts: [],
      pubsub_token: 'token',
      avatar_url: 'url',
      available_name: 'name',
      role: 'agent' as UserRole,
      identifier_hash: 'hash',
      availability: 'online',
      thumbnail: 'thumbnail',
      availability_status: 'online' as AvailabilityStatus,
      type: 'user',
    },
    accessToken: 'token',
    headers: { 'access-token': 'token', uid: 'uid', client: 'client' },
  };

  const userWithAccounts = {
    ...mockUser,
    id: 1,
    account_id: 123,
    accounts: [
      {
        id: 123,
        active_at: '',
        auto_offline: false,
        availability: 'online',
        availability_status: 'online' as AvailabilityStatus,
        custom_role: '',
        custom_role_id: '',
        name: 'Account 1',
        permissions: [],
        role: 'agent' as UserRole,
        status: 'active',
      },
      {
        id: 456,
        active_at: '',
        auto_offline: false,
        availability: 'online',
        availability_status: 'online' as AvailabilityStatus,
        custom_role: '',
        custom_role_id: '',
        name: 'Account 2',
        permissions: [],
        role: 'agent' as UserRole,
        status: 'active',
      },
    ],
    pubsub_token: '',
    avatar_url: '',
    available_name: '',
    role: 'agent' as UserRole,
    availability: 'online',
    availability_status: 'online' as AvailabilityStatus,
    identifier_hash: '',
    thumbnail: '',
    type: 'user',
  };

  it('should handle initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('basic reducers', () => {
    it('should handle logout', () => {
      expect(() => authReducer(loggedInState, logout())).not.toThrow();
    });

    it('should handle resetAuth', () => {
      expect(authReducer(loggedInState, resetAuth())).toEqual(initialState);
    });

    it('should handle setAccount', () => {
      const state = {
        ...initialState,
        user: {
          ...mockUser,
          accounts: [],
          role: 'agent' as UserRole,
          availability_status: 'online' as AvailabilityStatus,
          pubsub_token: 'token',
          avatar_url: 'url',
          available_name: 'name',
          identifier_hash: 'hash',
          availability: 'online',
          thumbnail: 'thumbnail',
          type: 'user',
        },
      };
      expect(authReducer(state, setAccount(123))).toEqual(state);
    });
  });

  describe('setCurrentUserAvailability', () => {
    it('should update availability for matching user and account', () => {
      const state = {
        ...initialState,
        user: userWithAccounts,
      };

      const action = {
        type: 'auth/setCurrentUserAvailability',
        payload: {
          users: {
            '1': 'busy',
          },
        },
      };

      const nextState = authReducer(state, action);
      expect(nextState.user?.accounts[0].availability).toBe('busy');
      expect(nextState.user?.accounts[0].availability_status).toBe('busy');
      expect(nextState.user?.accounts[1].availability).toBe('online');
    });

    it('should not update for non-matching user ID', () => {
      const state = {
        ...initialState,
        user: { ...userWithAccounts, id: 2 },
      };

      const action = {
        type: 'auth/setCurrentUserAvailability',
        payload: {
          users: {
            '1': 'busy',
          },
        },
      };

      expect(authReducer(state, action)).toEqual(state);
    });

    it('should not update when user is null', () => {
      const state = { ...initialState, user: null };
      const action = {
        type: 'auth/setCurrentUserAvailability',
        payload: { users: { '1': 'busy' } },
      };

      expect(authReducer(state, action)).toEqual(state);
    });
  });

  describe('auth async actions', () => {
    it('should set isLoggingIn flag when login is pending', () => {
      const action = { type: authActions.login.pending.type };
      const state = authReducer(initialState, action);
      expect(state.uiFlags.isLoggingIn).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle successful login', () => {
      const payload = {
        user: mockUser,
        headers: { 'access-token': 'token', uid: 'uid', client: 'client' },
      };
      const action = { type: authActions.login.fulfilled.type, payload };
      const state = authReducer(initialState, action);

      expect(state.user).toEqual(mockUser);
      expect(state.headers).toEqual(payload.headers);
      expect(state.uiFlags.isLoggingIn).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle login failure', () => {
      const error = 'Invalid credentials';
      const action = {
        type: authActions.login.rejected.type,
        payload: { errors: [error] },
      };
      const state = authReducer(initialState, action);

      expect(state.uiFlags.isLoggingIn).toBe(false);
      expect(state.error).toBe(error);
    });
  });
});
