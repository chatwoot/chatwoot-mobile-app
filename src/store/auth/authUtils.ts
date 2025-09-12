import { AxiosError } from 'axios';
import { showToast } from '@/utils/toastUtils';
import I18n from '@/i18n';
import type { ApiErrorResponse } from './authTypes';

export const handleApiError = (error: unknown, customErrorMsg?: string) => {
  const { response } = error as AxiosError<ApiErrorResponse>;

  if (response?.status === 401) {
    const { errors } = response.data;
    if (errors?.[0]) {
      showToast({ message: errors[0] });
      return { success: false, errors };
    }
  }

  const message = customErrorMsg || I18n.t('ERRORS.COMMON_ERROR');
  showToast({ message });
  return { success: false, errors: [message] };
};
