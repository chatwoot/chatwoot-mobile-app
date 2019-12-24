import axios from 'axios';

import { BASE_URL } from '../constants/url';
import I18n from '../i18n';

import { showToast } from './ToastHelper';

const parseErrorCode = error => {
  if (error.response) {
    if (error.response.status === 401) {
      const {
        errors: [message],
      } = error.response.data;
      showToast({ message });
    }
  } else {
    showToast({ message: I18n.t('ERRORS.COMMON_ERROR') });
  }

  return Promise.reject(error.response);
};

const API = axios.create();
API.defaults.baseURL = BASE_URL;
// Request parsing interceptor
API.interceptors.request.use(
  async config => {
    const headerConf = config;
    // const token = await getToken();
    // headerConf.headers.token = token;
    return headerConf;
  },
  error => Promise.reject(error),
);

// Response parsing interceptor
API.interceptors.response.use(
  response => response,
  error => parseErrorCode(error),
);

export default API;
