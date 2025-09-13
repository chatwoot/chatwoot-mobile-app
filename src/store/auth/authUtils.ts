import { AxiosError } from 'axios';
import { showToast } from '@/utils/toastUtils';
import I18n from '@/i18n';
import type { ApiErrorResponse } from './authTypes';

export const handleApiError = (error: unknown, customErrorMsg?: string) => {
  const { response } = error as AxiosError<ApiErrorResponse>;

  // Handle specific error responses (401, 400, etc.)
  if (response?.status === 401 || response?.status === 400) {
    const { errors } = response.data;
    if (errors?.[0]) {
      showToast({ message: errors[0] });
      return { success: false, errors };
    }

    // If no errors array, check for error field
    const responseData = response.data as any;
    if (responseData?.error) {
      const errorMessage = responseData.error;
      showToast({ message: errorMessage });
      return { success: false, errors: [errorMessage] };
    }
  }

  const message = customErrorMsg || I18n.t('ERRORS.COMMON_ERROR');
  showToast({ message });
  return { success: false, errors: [message] };
};
