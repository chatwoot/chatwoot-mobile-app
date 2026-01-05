import axios, {
    AxiosError,
    AxiosRequestConfig,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios';
import Constants from 'expo-constants';

import I18n from '@/i18n';
import { getStore } from '@/store/storeAccessor';
import { BrandTokens } from '@/theme';
import { showToast } from '@/utils/toastUtils';

const nonAccountRoutes = [
  'profile',
  'profile/availability',
  'notification_subscriptions',
  'profile/set_active_account',
];

function isKanbanRoute(url: string | undefined): boolean {
  if (!url) return false;
  return url.startsWith('kanban/');
}

function isBackendRoute(url: string | undefined): boolean {
  if (!url) return false;
  const result = url.includes('move_to_inbox') || url.includes('bulk_move_to_inbox');
  if (result) {
    console.log('[APIService] isBackendRoute detected:', url);
  }
  return result;
}

// Get backend URL from extra or use default
const backendBaseUrl = Constants.expoConfig?.extra?.backendUrl || 'https://api.notchat.me';

function getBackendUrl(): string {
  return backendBaseUrl;
}

class APIService {
  private static instance: APIService;
  private api = axios.create({
    timeout: 30000, // 30 segundos timeout padrão
  });

  private constructor() {
    this.setupInterceptors();
  }

  public static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  private async getHeaders() {
    const store = getStore();
    const state = store.getState();
    const headers = state.auth.headers;

    // Sempre usar headers do Redux (token automático do login)
    if (!headers || !headers['access-token']) {
      console.warn('[APIService] getHeaders: No headers or access-token found in Redux state');
      console.warn('[APIService] state.auth.headers:', state.auth.headers);
      return {};
    }

    console.log(
      '[APIService] getHeaders: Token found, length:',
      headers['access-token']?.length || 0,
    );

    return {
      'access-token': headers['access-token'],
      uid: headers.uid,
      client: headers.client,
    };
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      async (config: AxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
        const store = getStore();
        const state = store.getState();
        const accountId = state.auth.user?.account_id;

        const isBackend = isBackendRoute(config.url);
        const isKanban = isKanbanRoute(config.url);

        console.log('[APIService] Route check:', {
          url: config.url,
          isKanban,
          isBackend,
          willUseBackend: isKanban || isBackend,
        });

        if (isKanban || isBackend) {
          config.baseURL = getBackendUrl();

          if (!accountId) {
            console.error('[APIService] Account ID is missing for backend route:', config.url);
            throw new Error('Account ID is required for backend routes');
          }

          const installationUrl = state.settings?.installationUrl;
          // PRIORIDADE 1: API Access Token (token de integração para Kanban, etc)
          // PRIORIDADE 2: Token de autenticação (fallback)
          const apiAccessToken = state.auth.apiAccessToken;
          const headers = await this.getHeaders();
          const authToken = headers['access-token'] || state.auth.headers?.['access-token'];
          const accessToken = apiAccessToken || authToken;

          // Log detalhado para debug
          console.log('[APIService] Token check for backend route:');
          console.log(
            '[APIService] API Access Token:',
            apiAccessToken ? `${apiAccessToken.substring(0, 20)}...` : 'missing',
          );
          console.log(
            '[APIService] Auth Token:',
            authToken ? `${authToken.substring(0, 20)}...` : 'missing',
          );
          console.log(
            '[APIService] Token type being used:',
            apiAccessToken ? 'API Access Token' : 'Auth Token (fallback)',
          );
          console.log(
            '[APIService] Final token being used:',
            accessToken ? `${accessToken.substring(0, 20)}...` : 'missing',
          );

          if (!installationUrl || !accessToken) {
            console.error('[APIService] Missing chatwoot_url or access_token for backend route');
            console.error('[APIService] installationUrl:', installationUrl);
            console.error('[APIService] accessToken:', accessToken ? 'present' : 'missing');
            console.error('[APIService] API Access Token:', apiAccessToken ? 'present' : 'missing');
            console.error('[APIService] Auth Token:', authToken ? 'present' : 'missing');
            throw new Error('Chatwoot URL and access token are required for backend routes');
          }

          // Garantir que o token não tenha espaços ou caracteres especiais
          const cleanAccessToken = accessToken.trim();

          let finalUrl: string;

          if (isKanbanRoute(config.url)) {
            const kanbanPath = (config.url || '').replace('kanban/', '');

            if (!kanbanPath || kanbanPath.includes('undefined')) {
              console.error(
                '[APIService] Invalid kanban path:',
                kanbanPath,
                'from URL:',
                config.url,
              );
              throw new Error('Invalid Kanban route path');
            }

            finalUrl = `api/kanban/accounts/${accountId}/${kanbanPath}`;
          } else {
            finalUrl = `api/accounts/${accountId}/${config.url || ''}`;
          }

          const chatwootUrlParam = encodeURIComponent(installationUrl);
          const accessTokenParam = encodeURIComponent(cleanAccessToken);
          const urlWithParams = `${finalUrl}?chatwoot_url=${chatwootUrlParam}&access_token=${accessTokenParam}`;

          console.log('[APIService] Backend route detected:');
          console.log('[APIService] HTTP Method:', config.method?.toUpperCase());
          console.log('[APIService] Original URL:', config.url);
          console.log('[APIService] Account ID:', accountId);
          console.log('[APIService] Backend URL:', config.baseURL);
          console.log('[APIService] Installation URL:', installationUrl);
          console.log(
            '[APIService] Access Token (first 20 chars):',
            cleanAccessToken ? `${cleanAccessToken.substring(0, 20)}...` : 'missing',
          );
          console.log('[APIService] Access Token length:', cleanAccessToken?.length || 0);
          console.log(
            '[APIService] Using token type:',
            apiAccessToken ? 'API Access Token (for integrations)' : 'Auth Token (fallback)',
          );
          console.log('[APIService] Final URL with params:', urlWithParams);
          console.log('[APIService] Full URL:', `${config.baseURL}/${urlWithParams}`);

          config.url = urlWithParams;

          config.headers = {
            ...config.headers,
            // Não incluir headers do Chatwoot (uid, client) para rotas do backend
            // Apenas os headers específicos do backend
            'X-Chatwoot-URL': installationUrl,
            'X-Access-Token': cleanAccessToken,
            'Chatwoot-URL': installationUrl,
            'Access-Token': cleanAccessToken,
          };
        } else {
          // Rotas do Chatwoot - sempre usar token automático do Redux
          config.baseURL = state.settings?.installationUrl;

          // Para rotas do Chatwoot, usar token automático do Redux
          const headers = await this.getHeaders();

          if (accountId && config.url && !nonAccountRoutes.includes(config.url)) {
            config.url = `api/v1/accounts/${accountId}/${config.url}`;
          } else if (nonAccountRoutes.includes(config.url || '')) {
            config.url = `api/v1/${config.url}`;
          }

          config.headers = {
            ...config.headers,
            ...headers,
          };

          if (headers['access-token']) {
            console.log(
              '[APIService] Using Chatwoot token (auto) for route:',
              config.url,
              headers['access-token'].substring(0, 10) + '...',
            );
          } else {
            console.warn('[APIService] No access token available for Chatwoot route:', config.url);
          }
        }

        return config as InternalAxiosRequestConfig;
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
          const method = error.config?.method?.toUpperCase();
          const status = error.response?.status;
          const url = error.config?.url || '';

          const isDeleteRequest = method === 'DELETE';
          const isKanbanFunnelDelete =
            isDeleteRequest && (url.includes('/funnels/') || url.includes('kanban/funnels'));

          // Não mostrar toast para erros de envio de mensagem (já tem tratamento próprio)
          const isSendMessage = url.includes('/messages') && method === 'POST';

          // Não mostrar toast para toggle_typing_status (não crítico)
          const isToggleTyping = url.includes('toggle_typing_status');

          if (isKanbanFunnelDelete && status === 500) {
            console.warn(
              '[APIService] DELETE funnel returned 500, but operation may have succeeded:',
              url,
            );
            return Promise.reject(error);
          }

          const errorData = error.response?.data as { message?: string } | undefined;
          const errorMessage = errorData?.message || error.message || I18n.t('ERRORS.COMMON_ERROR', { appName: BrandTokens.name });

          console.error('[APIService] Request error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
          });

          // Mostrar toast apenas para erros que não têm tratamento específico
          if ((!isKanbanFunnelDelete || status !== 500) && !isSendMessage && !isToggleTyping) {
            showToast({ message: errorMessage });
          }
        }
        return Promise.reject(error);
      },
    );
  }

  public async get<T>(url: string, config?: AxiosRequestConfig) {
    return this.api.get<T>(url, config);
  }

  public async post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) {
    const isFileUpload = config?.headers?.['Content-Type']?.includes('multipart/form-data');
    const defaultTimeout = isFileUpload ? 60000 : undefined;

    return this.api.post<T>(url, data, {
      ...config,
      timeout: config?.timeout ?? defaultTimeout,
    });
  }

  public async put<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) {
    return this.api.put<T>(url, data, config);
  }

  public async patch<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) {
    return this.api.patch<T>(url, data, config);
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.api.delete<T>(url, config);
  }
}

export const apiService = APIService.getInstance();
