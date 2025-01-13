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
