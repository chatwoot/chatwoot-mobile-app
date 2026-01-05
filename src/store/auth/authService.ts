import { apiService } from '@/services/APIService';
import { getStore } from '@/store/storeAccessor';
import type { User } from '@/types/User';
import type {
  AvailabilityPayload,
  LoginApiResponse,
  LoginPayload,
  LoginResponse,
  MfaRequiredResponse,
  MfaVerificationPayload,
  ProfileResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  SetActiveAccountPayload,
  SsoAuthPayload,
  SsoAuthResponse,
} from './authTypes';

export class AuthService {
  static async login(credentials: LoginPayload): Promise<LoginResponse | MfaRequiredResponse> {
    const response = await apiService.post<LoginApiResponse>('auth/sign_in', credentials);

    // Check if MFA is required
    if (response.data.mfa_required) {
      return {
        mfa_required: true,
        mfa_token: response.data.mfa_token,
      } as MfaRequiredResponse;
    }

    // Regular login response
    const userData = response.data.data;

    // Tentar extrair access_token de diferentes possíveis locais
    const apiAccessToken =
      (userData as any)?.access_token ||
      (response.data as any)?.access_token ||
      (response.data as any)?.data?.access_token ||
      null;

    // Log para debug
    console.log('[AuthService] Login successful');
    console.log('[AuthService] Response structure:', {
      hasData: !!response.data,
      hasDataData: !!response.data?.data,
      responseDataKeys: response.data ? Object.keys(response.data) : [],
      userDataKeys: userData ? Object.keys(userData) : [],
    });
    console.log(
      '[AuthService] API Access Token from response:',
      apiAccessToken ? `${apiAccessToken.substring(0, 20)}...` : 'NOT FOUND',
    );

    return {
      user: userData as User,
      headers: {
        'access-token': response.headers['access-token'],
        uid: response.headers.uid,
        client: response.headers.client,
      },
      // O access_token vem no body da resposta e é o API Access Token
      apiAccessToken: apiAccessToken,
    } as LoginResponse;
  }

  static async verifyMfa(payload: MfaVerificationPayload): Promise<LoginResponse> {
    const response = await apiService.post<{ data: User & { access_token?: string } }>(
      'auth/sign_in',
      payload,
    );
    const userData = response.data.data;
    return {
      user: userData as User,
      headers: {
        'access-token': response.headers['access-token'],
        uid: response.headers.uid,
        client: response.headers.client,
      },
      // O access_token vem no body da resposta e é o API Access Token
      apiAccessToken: userData?.access_token || null,
    };
  }
  static async getProfile(): Promise<ProfileResponse> {
    const response = await apiService.get<ProfileResponse>('profile');
    return response.data;
  }
  static async resetPassword(payload: ResetPasswordPayload): Promise<ResetPasswordResponse> {
    const response = await apiService.post<ResetPasswordResponse>('auth/password', payload);
    return response.data;
  }
  static async updateAvailability(payload: AvailabilityPayload): Promise<ProfileResponse> {
    const response = await apiService.post<ProfileResponse>('profile/availability', payload);
    return response.data;
  }

  static async setActiveAccount(payload: SetActiveAccountPayload): Promise<ProfileResponse> {
    const response = await apiService.put<ProfileResponse>('profile/set_active_account', payload);

    const headers = {
      'access-token': response.headers['access-token'] || response.headers['Access-Token'] || '',
      uid: response.headers.uid || response.headers['Uid'] || '', // Corrigir: era "uui"
      client: response.headers.client || response.headers['Client'] || '',
    };

    return {
      ...response.data,
      headers,
    };
  }

  static async loginWithSso(payload: SsoAuthPayload): Promise<SsoAuthResponse> {
    const response = await apiService.post<{ data: User & { access_token?: string } }>(
      'auth/sign_in',
      payload,
    );
    const userData = response.data.data;
    return {
      user: userData as User,
      headers: {
        'access-token': response.headers['access-token'],
        uid: response.headers.uid,
        client: response.headers.client,
      },
      // O access_token vem no body da resposta e é o API Access Token
      apiAccessToken: userData?.access_token || null,
    } as SsoAuthResponse;
  }

  /**
   * Retorna o API Access Token que já foi salvo durante o login
   * O token vem no body da resposta do login (data.access_token)
   */
  static async getApiAccessToken(): Promise<string | null> {
    const store = getStore();
    const state = store.getState();
    const apiAccessToken = state.auth.apiAccessToken;

    if (apiAccessToken) {
      console.log('[AuthService] API Access Token found in Redux state');
      return apiAccessToken;
    }

    console.warn('[AuthService] API Access Token not found in Redux state');
    return null;
  }
}
