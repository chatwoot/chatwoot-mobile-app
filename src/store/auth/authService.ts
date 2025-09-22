import { apiService } from '@/services/APIService';
import type { User } from '@/types/User';
import type {
  LoginPayload,
  LoginResponse,
  LoginApiResponse,
  MfaRequiredResponse,
  MfaVerificationPayload,
  ResetPasswordPayload,
  ResetPasswordResponse,
  AvailabilityPayload,
  ProfileResponse,
  SetActiveAccountPayload,
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
    return {
      user: response.data.data,
      headers: {
        'access-token': response.headers['access-token'],
        uid: response.headers.uid,
        client: response.headers.client,
      },
    } as LoginResponse;
  }

  static async verifyMfa(payload: MfaVerificationPayload): Promise<LoginResponse> {
    const response = await apiService.post<{ data: User }>('auth/sign_in', payload);
    return {
      user: response.data.data,
      headers: {
        'access-token': response.headers['access-token'],
        uid: response.headers.uid,
        client: response.headers.client,
      },
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
    return response.data;
  }
}
