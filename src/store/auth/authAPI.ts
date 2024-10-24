import { apiService } from '@/helpers-next/APIService';
import { User } from '@/types/User';

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
export class AuthService {
  static async login(credentials: LoginPayload): Promise<LoginResponse> {
    const response = await apiService.post<{ data: User }>('auth/sign_in', credentials);
    return {
      user: response.data.data,
      headers: {
        'access-token': response.headers['access-token'],
        uid: response.headers.uid,
        client: response.headers.client,
      },
    };
  }
}
