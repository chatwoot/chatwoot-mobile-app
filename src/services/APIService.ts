import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

import { getStore } from '@/store/storeAccessor';
import I18n from '@/i18n';
import { showToast } from '@/utils/toastUtils';

const nonAccountRoutes = [
  'profile',
  'profile/availability',
  'notification_subscriptions',
  'profile/set_active_account',
];

class APIService {
  private static instance: APIService;
  private api = axios.create();

  private constructor() {
    this.setupInterceptors();
  }

  public static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  private getHeaders() {
    const store = getStore();
    const state = store.getState();
    const headers = state.auth.headers;
    if (!headers) return {};

    return {
      'access-token': headers['access-token'],
      uid: headers.uid,
      client: headers.client,
    };
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      async (config: AxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
        const headers = this.getHeaders();
        const store = getStore();
        const state = store.getState();
        config.baseURL = state.settings?.installationUrl;
        const accountId = state.auth.user?.account_id;
        if (accountId && config.url && !nonAccountRoutes.includes(config.url)) {
          config.url = `api/v1/accounts/${accountId}/${config.url}`;
        } else if (nonAccountRoutes.includes(config.url || '')) {
          config.url = `api/v1/${config.url}`;
        }
        return {
          ...config,
          headers: {
            ...config.headers,
            ...headers,
          },
        } as InternalAxiosRequestConfig;
      },
      (error: AxiosError) => Promise.reject(error),
    );

    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          const store = getStore();
          store.dispatch({ type: 'auth/logout' });
        } else {
          showToast({ message: I18n.t('ERRORS.COMMON_ERROR') });
        }
        return Promise.reject(error);
      },
    );
  }

  public async get<T>(url: string, config?: AxiosRequestConfig) {
    return this.api.get<T>(url, config);
  }
  public async post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) {
    return this.api.post<T>(url, data, config);
  }

  public async put<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) {
    return this.api.put<T>(url, data, config);
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.api.delete<T>(url, config);
  }
}

export const apiService = APIService.getInstance();
