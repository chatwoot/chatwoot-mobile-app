import axios from 'axios';
import * as Sentry from '@sentry/react-native';

import { API_URL } from '../constants/url';
import I18n from '../i18n'; 

import { showToast } from './ToastHelper';
import { getHeaders, getBaseUrl } from '../services/auth';
import { handleLogout } from '../reducer/authHelper'; 
import { getStore } from '@/store/storeAccessor';

const parseErrorCode = error => {
  Sentry.captureException(error);
  if (error.response) {
    if (error.response.status === 401) {
      handleLogout();
    }
  } else {
    showToast({ message: I18n.t('ERRORS.COMMON_ERROR') });
  }
  return Promise.reject(error);
};

const API = axios.create();

// Request parsing interceptor
API.interceptors.request.use(
  async config => {
    const headers = await getHeaders();
    config.baseURL = await getBaseUrl();
    const configHeaders = config.headers;
    if (headers) {
      config.headers = {
        ...configHeaders,
        ...headers,
      };
      const { accountId } = headers;
      if (accountId) {
        config.url = `${API_URL}accounts/${accountId}/${config.url}`;
      }
    }
    return config;
  },
  error => Promise.reject(error),
);

// Response parsing interceptor
API.interceptors.response.use(
  response => response,
  error => parseErrorCode(error),
);

export default API;
