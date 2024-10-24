import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { AuthService, LoginPayload, LoginResponse } from './authAPI';
import { showToast } from '@/helpers-next/ToastHelper';
import I18n from '@/i18n';

interface ErrorResponse {
  success: boolean;
  errors: string[];
}

export const authActions = {
  login: createAsyncThunk<LoginResponse, LoginPayload, { rejectValue: ErrorResponse }>(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
      try {
        return await AuthService.login(credentials);
      } catch (error: unknown) {
        const { response } = error as AxiosError<ErrorResponse>;

        if (response && response.status === 401) {
          const { errors } = response.data;
          const hasAuthErrorMsg = errors && errors.length > 0 && typeof errors[0] === 'string';
          if (hasAuthErrorMsg) {
            showToast({ message: errors[0] });
          } else {
            showToast({ message: I18n.t('ERRORS.AUTH') });
          }
          if (!errors) {
            throw errors;
          }
          return rejectWithValue({ success: false, errors });
        }
        showToast({ message: I18n.t('ERRORS.COMMON_ERROR') });
        return rejectWithValue({ success: false, errors: [I18n.t('ERRORS.COMMON_ERROR')] });
      }
    },
  ),
};
