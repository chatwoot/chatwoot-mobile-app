import type { User } from '@/types/User';

export interface AuthHeaders {
  'access-token': string;
  uid: string;
  client: string;
}
export interface LoginPayload {
  email: string;
  password: string;
}
export interface LoginResponse {
  user: User;
  headers: AuthHeaders;
}

export interface MfaRequiredResponse {
  mfa_required: true;
  mfa_token: string;
}

export interface MfaVerificationPayload {
  mfa_token: string;
  otp_code?: string;
  backup_code?: string;
}

export interface LoginApiResponse {
  data?: User;
  mfa_required?: boolean;
  mfa_token?: string;
}
export interface ResetPasswordPayload {
  email: string;
}
export interface ResetPasswordResponse {
  message: string;
}

export interface AvailabilityPayload {
  profile: {
    availability: string;
    account_id: string;
  };
}

export interface ProfileResponse {
  user: User;
}

export interface ApiErrorResponse {
  success: boolean;
  errors: string[];
}

export interface SetActiveAccountPayload {
  profile: {
    account_id: number;
  };
}

export interface SsoAuthPayload {
  email: string;
  sso_auth_token: string;
}

export interface SsoAuthResponse {
  user: User;
  headers: AuthHeaders;
}
