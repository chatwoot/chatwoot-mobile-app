import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

import { store } from '@/store';
import I18n from '@/i18n';
import { showToast } from './ToastHelper';

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
    const state = store.getState();
    const headers = state.authv4.headers;
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
        const state = store.getState();
        const baseURL = state.settings?.installationUrl;
        return {
          ...config,
          baseURL,
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

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.api.post<T>(url, data, config);
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.api.put<T>(url, data, config);
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.api.delete<T>(url, config);
  }
}

export const apiService = APIService.getInstance();
