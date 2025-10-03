import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { authActions } from '@/store/auth/authActions';
import { AppDispatch } from '@/store';

WebBrowser.maybeCompleteAuthSession();

export interface SsoLoginParams {
  email?: string;
  sso_auth_token?: string;
  error?: string;
}

export class SsoUtils {
  /**
   * Initiates SSO login flow using Expo AuthSession
   * @param installationUrl - The Chatwoot installation URL
   * @returns Promise with SSO login result
   */
  static async loginWithSSO(installationUrl: string): Promise<AuthSession.AuthSessionResult> {
    try {
      // Create redirect URI with custom scheme
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'chatwootapp',
        path: 'sso/callback',
      });

      // Construct SSO auth URL with mobile redirect URI parameter
      const authUrl = `${installationUrl}app/login/sso?target=mobile`;

      // Start auth session
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      return result;
    } catch (error) {
      console.error('SSO login error:', error);
      throw error;
    }
  }

  /**
   * Handles SSO callback parameters and completes authentication
   * @param params - Parameters from SSO callback
   * @param dispatch - Redux dispatch function
   * @returns Promise<boolean> - Success status
   */
  static async handleSsoCallback(params: SsoLoginParams, dispatch: AppDispatch): Promise<boolean> {
    try {
      // Check for error in callback
      if (params.error) {
        return false;
      }

      // Validate required parameters
      if (!params.email || !params.sso_auth_token) {
        return false;
      }

      // Dispatch SSO login action
      const result = await dispatch(
        authActions.loginWithSso({
          email: params.email,
          sso_auth_token: params.sso_auth_token,
        }),
      );

      // Check if login was successful
      if (authActions.loginWithSso.fulfilled.match(result)) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Validates if the current installation supports SSO
   * @param installationUrl - The Chatwoot installation URL
   * @returns Promise<boolean> - Whether SSO is supported
   */
  static async validateSsoSupport(installationUrl: string): Promise<boolean> {
    try {
      // This could be extended to check if the installation supports SSO
      // For now, we assume all installations support SSO if they have the correct URL format
      return installationUrl && installationUrl.startsWith('https://');
    } catch (error) {
      return false;
    }
  }

  /**
   * Parses URL parameters from SSO callback
   * @param url - The callback URL
   * @returns Parsed parameters
   */
  static parseCallbackUrl(url: string): SsoLoginParams {
    try {
      const urlObj = new URL(url);
      const params: SsoLoginParams = {};

      // Extract parameters from URL and decode email properly
      const rawEmail = urlObj.searchParams.get('email');
      params.email = rawEmail ? decodeURIComponent(rawEmail) : undefined;
      params.sso_auth_token = urlObj.searchParams.get('sso_auth_token') || undefined;
      params.error = urlObj.searchParams.get('error') || undefined;

      return params;
    } catch (error) {
      return {};
    }
  }
}
