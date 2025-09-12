import { authActions } from '@/store/auth/authActions';
import { AuthService } from '@/store/auth/authService';
import { mockUser } from './authMockData';

// Mock the entire AuthService module
jest.mock('@/store/auth/authService', () => ({
  AuthService: {
    login: jest.fn(),
  },
}));

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

jest.mock('@/i18n', () => ({
  t: (key: string) => key,
}));

jest.mock('@/utils/toastUtils', () => ({
  showToast: jest.fn(),
}));

describe('Auth Actions', () => {
  const mockHeaders = {
    'access-token': 'token',
    uid: 'uid',
    client: 'client',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login action', () => {
    const mockCredentials = {
      email: 'test@example.com',
      password: 'password',
    };

    const mockLoginResponse = {
      user: mockUser,
      headers: mockHeaders,
    };

    it('should handle successful login', async () => {
      // Mock the AuthService.login to return successful response
      (AuthService.login as jest.Mock).mockResolvedValueOnce(mockLoginResponse);

      // Create mock dispatch and getState functions
      const dispatch = jest.fn();
      const getState = jest.fn();

      // Execute the thunk
      const thunk = authActions.login(mockCredentials);
      await thunk(dispatch, getState, undefined);

      // Check if the AuthService.login was called with correct parameters
      expect(AuthService.login).toHaveBeenCalledWith(mockCredentials);

      // Check if correct actions were dispatched
      const actions = dispatch.mock.calls.map(call => call[0].type);
      expect(actions).toEqual([authActions.login.pending.type, authActions.login.fulfilled.type]);

      // Check the payload of the fulfilled action
      const fulfilledAction = dispatch.mock.calls[1][0];
      expect(fulfilledAction.payload).toEqual(mockLoginResponse);
    });

    it('should handle login failure', async () => {
      // Mock the error response
      const mockError = new Error('Invalid credentials');
      (AuthService.login as jest.Mock).mockRejectedValueOnce(mockError);

      const dispatch = jest.fn();
      const getState = jest.fn();

      // Execute the thunk
      const thunk = authActions.login(mockCredentials);
      await thunk(dispatch, getState, undefined);

      // Check if correct actions were dispatched
      const actions = dispatch.mock.calls.map(call => call[0].type);
      expect(actions).toEqual([authActions.login.pending.type, authActions.login.rejected.type]);
    });
  });
});
