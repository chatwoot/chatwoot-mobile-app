import { createAsyncThunk } from '@reduxjs/toolkit';
import { AuthService } from './authService';
import type {
  LoginPayload,
  LoginResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  AvailabilityPayload,
  ProfileResponse,
  ApiErrorResponse,
} from './authTypes';
import { handleApiError } from './authUtils';
import I18n from '@/i18n';

const createAuthThunk = <TResponse, TPayload>(
  type: string,
  handler: (payload: TPayload) => Promise<TResponse>,
  errorMessage?: string,
) => {
  return createAsyncThunk<TResponse, TPayload, { rejectValue: ApiErrorResponse }>(
    type,
    async (payload, { rejectWithValue }) => {
      try {
        return await handler(payload);
      } catch (error) {
        return rejectWithValue(handleApiError(error, errorMessage));
      }
    },
  );
};
export const authActions = {
  login: createAuthThunk<LoginResponse, LoginPayload>(
    'auth/login',
    AuthService.login,
    I18n.t('ERRORS.AUTH'),
  ),

  getProfile: createAuthThunk<ProfileResponse, void>('auth/getProfile', () =>
    AuthService.getProfile(),
  ),

  resetPassword: createAuthThunk<ResetPasswordResponse, ResetPasswordPayload>(
    'auth/resetPassword',
    AuthService.resetPassword,
  ),

  updateAvailability: createAuthThunk<ProfileResponse, AvailabilityPayload>(
    'auth/updateAvailability',
    AuthService.updateAvailability,
  ),
};
