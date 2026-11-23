import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { SsoUtils } from '../ssoUtils';
import { showToast } from '../toastUtils';
import { authActions } from '@/store/auth/authActions';
import { SSO_CALLBACK_URL } from '@/constants';

jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(),
}));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(),
}));

jest.mock('../toastUtils', () => ({
  showToast: jest.fn(),
}));

jest.mock('@/i18n', () => ({
  t: jest.fn((key: string) => key),
}));

describe('SsoUtils', () => {
  const makeRedirectUriMock = AuthSession.makeRedirectUri as jest.Mock;
  const openAuthSessionAsyncMock = WebBrowser.openAuthSessionAsync as jest.Mock;
  const showToastMock = showToast as jest.Mock;
  const dispatchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    SsoUtils.clearHandledTokens();
  });

  describe('loginWithSSO', () => {
    it('generates redirect URI matching server callback SSO_CALLBACK_URL and opens auth session', async () => {
      makeRedirectUriMock.mockReturnValue(SSO_CALLBACK_URL);
      openAuthSessionAsyncMock.mockResolvedValue({
        type: 'success',
        url: `${SSO_CALLBACK_URL}?email=test%40example.com&sso_auth_token=token123`,
      });

      const installationUrl = 'https://app.chatwoot.com/';
      const result = await SsoUtils.loginWithSSO(installationUrl);

      expect(makeRedirectUriMock).toHaveBeenCalledWith({
        scheme: 'chatwootapp',
        path: 'auth/saml',
        native: SSO_CALLBACK_URL,
      });
      expect(openAuthSessionAsyncMock).toHaveBeenCalledWith(
        'https://app.chatwoot.com/app/login/sso?target=mobile',
        SSO_CALLBACK_URL,
      );
      expect(result).toEqual({
        type: 'success',
        url: `${SSO_CALLBACK_URL}?email=test%40example.com&sso_auth_token=token123`,
      });
    });

    it('rethrows error when openAuthSessionAsync fails', async () => {
      makeRedirectUriMock.mockReturnValue(SSO_CALLBACK_URL);
      const error = new Error('Browser failed to open');
      openAuthSessionAsyncMock.mockRejectedValue(error);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(SsoUtils.loginWithSSO('https://app.chatwoot.com/')).rejects.toThrow(
        'Browser failed to open',
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith('SSO login error:', error);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('parseCallbackUrl', () => {
    it('parses email and sso_auth_token successfully from callback URL', () => {
      const url = `${SSO_CALLBACK_URL}?email=user%2Btest%40chatwoot.com&sso_auth_token=xyz789`;
      const params = SsoUtils.parseCallbackUrl(url);

      expect(params).toEqual({
        email: 'user+test@chatwoot.com',
        sso_auth_token: 'xyz789',
        error: undefined,
      });
    });

    it('parses error parameter when present', () => {
      const url = `${SSO_CALLBACK_URL}?error=unauthorized`;
      const params = SsoUtils.parseCallbackUrl(url);

      expect(params).toEqual({
        email: undefined,
        sso_auth_token: undefined,
        error: 'unauthorized',
      });
    });

    it('returns empty object when URL is malformed', () => {
      const params = SsoUtils.parseCallbackUrl('invalid-url');
      expect(params).toEqual({});
    });
  });

  describe('handleSsoCallback', () => {
    it('shows toast and returns false when error parameter is present', async () => {
      const result = await SsoUtils.handleSsoCallback({ error: 'access_denied' }, dispatchMock);

      expect(showToastMock).toHaveBeenCalledWith({
        message: 'LOGIN.SSO_AUTH_FAILED',
      });
      expect(dispatchMock).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('shows toast and returns false when email or sso_auth_token is missing', async () => {
      const resultWithoutToken = await SsoUtils.handleSsoCallback(
        { email: 'user@chatwoot.com' },
        dispatchMock,
      );

      expect(showToastMock).toHaveBeenCalledWith({
        message: 'LOGIN.SSO_INVALID_RESPONSE',
      });
      expect(dispatchMock).not.toHaveBeenCalled();
      expect(resultWithoutToken).toBe(false);

      showToastMock.mockClear();

      const resultWithoutEmail = await SsoUtils.handleSsoCallback(
        { sso_auth_token: 'token123' },
        dispatchMock,
      );

      expect(showToastMock).toHaveBeenCalledWith({
        message: 'LOGIN.SSO_INVALID_RESPONSE',
      });
      expect(dispatchMock).not.toHaveBeenCalled();
      expect(resultWithoutEmail).toBe(false);
    });

    it('dispatches loginWithSso and returns true on success', async () => {
      const fulfilledAction = {
        type: authActions.loginWithSso.fulfilled.type,
        payload: { user: { id: 1 }, headers: {} },
      };
      dispatchMock.mockResolvedValue(fulfilledAction);

      const result = await SsoUtils.handleSsoCallback(
        { email: 'user@chatwoot.com', sso_auth_token: 'token123' },
        dispatchMock,
      );

      expect(dispatchMock).toHaveBeenCalledTimes(1);
      expect(showToastMock).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('shows toast and returns false when login is rejected', async () => {
      const rejectedAction = {
        type: authActions.loginWithSso.rejected.type,
        payload: { errors: ['Invalid token'] },
      };
      dispatchMock.mockResolvedValue(rejectedAction);

      const result = await SsoUtils.handleSsoCallback(
        { email: 'user@chatwoot.com', sso_auth_token: 'token123' },
        dispatchMock,
      );

      expect(dispatchMock).toHaveBeenCalledTimes(1);
      expect(showToastMock).toHaveBeenCalledWith({
        message: 'LOGIN.SSO_AUTH_FAILED',
      });
      expect(result).toBe(false);
    });

    it('catches unexpected dispatch error, shows toast and returns false', async () => {
      dispatchMock.mockRejectedValue(new Error('Network error'));

      const result = await SsoUtils.handleSsoCallback(
        { email: 'user@chatwoot.com', sso_auth_token: 'token123' },
        dispatchMock,
      );

      expect(showToastMock).toHaveBeenCalledWith({
        message: 'LOGIN.SSO_UNEXPECTED_ERROR',
      });
      expect(result).toBe(false);
    });

    it('deduplicates simultaneous or duplicate callbacks with the same token', async () => {
      const fulfilledAction = {
        type: authActions.loginWithSso.fulfilled.type,
        payload: { user: { id: 1 }, headers: {} },
      };
      dispatchMock.mockResolvedValue(fulfilledAction);

      const firstCall = SsoUtils.handleSsoCallback(
        { email: 'user@chatwoot.com', sso_auth_token: 'duplicate_token' },
        dispatchMock,
      );
      const secondCall = SsoUtils.handleSsoCallback(
        { email: 'user@chatwoot.com', sso_auth_token: 'duplicate_token' },
        dispatchMock,
      );

      const [res1, res2] = await Promise.all([firstCall, secondCall]);

      expect(res1).toBe(true);
      expect(res2).toBe(true);
      expect(dispatchMock).toHaveBeenCalledTimes(1);
    });
  });
});
