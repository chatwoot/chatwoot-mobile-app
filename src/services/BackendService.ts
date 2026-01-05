import { BrandTokens } from '@/theme';
import axios, { AxiosInstance } from 'axios';
import Constants from 'expo-constants';

/**
 * Payload for registering a device with NOTCHAT backend
 */
export interface RegisterDevicePayload {
  chatwoot_url: string;
  agent_id: number;
  agent_email: string;
  access_token?: string; // Opcional: se account_id for fornecido, não é necessário
  fcm_token: string;
  account_id?: number; // Account ID do Chatwoot (opcional, mas recomendado)
  platform?: 'ios' | 'android';
  device_info?: {
    device_name: string;
    device_platform: string;
    api_level: string;
    brand_name: string;
    build_number: string;
    device_id: string;
  };
}

/**
 * Payload for updating FCM token
 */
export interface UpdateFcmTokenPayload {
  old_token: string;
  new_token: string;
  chatwoot_url: string;
  agent_id: number;
}

/**
 * Payload for getting API Access Token from backend
 */
export interface GetApiAccessTokenPayload {
  chatwoot_url: string;
  access_token: string;
  uid?: string;
  client?: string;
}

/**
 * Response from backend when getting API Access Token
 */
export interface GetApiAccessTokenResponse {
  api_access_token: string;
  success?: boolean;
  message?: string;
}

/**
 * Response from backend when verifying an instance
 */
export interface VerifyInstanceResponse {
  success: boolean;
  message?: string;
}

/**
 * BackendService handles all communication with the NOTCHAT Laravel backend.
 *
 * This service is responsible for:
 * - Registering devices with FCM tokens
 * - Updating FCM tokens when they refresh
 * - Unregistering devices on logout
 *
 * The backend acts as a central gateway that connects the app to multiple
 * Chatwoot instances via Firebase Cloud Messaging.
 */
class BackendService {
  private api: AxiosInstance;
  private baseUrl: string;

  constructor() {
    // Get backend URL from extra or use default
    const configBackendUrl = Constants.expoConfig?.extra?.backendUrl;
    this.baseUrl = configBackendUrl || 'https://api.notchat.me';

    // Log the backend URL being used (important for local development)
    console.log('[BackendService] ============================================');
    console.log('[BackendService] Backend URL Configuration:');
    console.log('[BackendService]   expoConfig.extra.backendUrl:', configBackendUrl || '(not set)');
    console.log('[BackendService]   Final base URL:', this.baseUrl);
    console.log('[BackendService] ============================================');

    // Create axios instance with base configuration
    // Timeout aumentado para 20 segundos para dar tempo ao backend validar o token
    this.api = axios.create({
      baseURL: this.baseUrl,
      timeout: 20000, // 20 segundos (aumentado de 10s para dar tempo à validação do token)
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Setup interceptors for logging and error handling
    this.setupInterceptors();
  }

  /**
   * Setup axios interceptors for request/response logging and error handling
   */
  private setupInterceptors(): void {
    // Request interceptor - log outgoing requests
    this.api.interceptors.request.use(
      config => {
        const fullUrl = `${config.baseURL}${config.url}`;
        console.log(`[BackendService] ${config.method?.toUpperCase()} ${fullUrl}`);
        if (config.data) {
          console.log('[BackendService] Request payload:', JSON.stringify(config.data, null, 2));
        }
        return config;
      },
      error => {
        console.error('[BackendService] Request error:', error);
        return Promise.reject(error);
      },
    );

    // Response interceptor - log responses and handle errors
    this.api.interceptors.response.use(
      response => {
        console.log(`[BackendService] Response ${response.status} from ${response.config.url}`);
        return response;
      },
      error => {
        if (error.response) {
          console.error(`[BackendService] Error ${error.response.status}:`, error.response.data);
        } else if (error.request) {
          console.error('[BackendService] No response received:', error.request);
        } else {
          console.error('[BackendService] Error:', error.message);
        }
        return Promise.reject(error);
      },
    );
  }

  /**
   * Register device with NOTCHAT backend
   *
   * This creates/updates the mapping:
   * chatwoot_url → agent_id → device_id → fcm_token
   *
   * The backend will:
   * 1. Check if a "client" exists with this chatwoot_url (create if not)
   * 2. Check if an "agent" exists for this client (create if not)
   * 3. Save/update the fcm_token in agent_devices table
   *
   * @param payload - Device registration data
   * @throws Error if registration fails
   */
  async registerDevice(payload: RegisterDevicePayload): Promise<void> {
    try {
      console.log('[BackendService] Registering device with backend...');
      console.log('[BackendService] Base URL:', this.baseUrl);
      console.log('[BackendService] Payload:', JSON.stringify(payload, null, 2));
      console.log(
        '[BackendService] Account ID being sent:',
        payload.account_id || 'NOT PROVIDED (backend will try to fetch)',
      );
      const response = await this.api.post('/api/register-device', payload);
      console.log('[BackendService] Device registered successfully');
      console.log('[BackendService] Response:', response.data);
      return response.data;
    } catch (error: any) {
      // Tratamento específico para erro 400 (token inválido)
      if (error.response?.status === 400) {
        const errorMessage =
          error.response?.data?.message ||
          'Por favor, conecte um token para poder espelhar os seus dados no app';

        // Log apenas para debug (não mostrar ao usuário)
        console.log('[BackendService] Error 400:', error.response?.data);

        // Retornar mensagem amigável
        throw new Error(errorMessage);
      }

      // Tratamento específico para Rate Limit (429)
      if (error.response?.status === 429) {
        console.warn('[BackendService] Rate limit atingido. Aguarde antes de tentar novamente.');
        throw new Error('Muitas tentativas. Aguarde um momento antes de tentar novamente.');
      }

      // Tratamento específico para timeout
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.error('[BackendService] Request timeout - validação do token pode estar demorando');
        throw new Error(
          'Tempo de espera esgotado. A validação do token está demorando mais que o esperado. Verifique sua conexão e tente novamente.',
        );
      }

      if (error.response) {
        // Log apenas para debug
        console.log('[BackendService] Failed to register device:', {
          status: error.response.status,
          data: error.response.data,
        });

        // Mensagem genérica amigável para outros erros
        const friendlyMessage =
          error.response.data?.message ||
          'Erro ao conectar com o servidor. Verifique sua conexão e tente novamente.';

        throw new Error(friendlyMessage);
      } else if (error.request) {
        console.error(
          '[BackendService] No response received. Check if backend is running at:',
          this.baseUrl,
        );
        throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
      }

      // Log genérico para outros erros
      console.log('[BackendService] Unexpected error:', error.message);
      throw error;
    }
  }

  /**
   * Update FCM token when Firebase refreshes it
   *
   * Firebase can periodically refresh FCM tokens. When this happens,
   * we need to update the backend's mapping so notifications continue
   * to be delivered.
   *
   * @param payload - Old and new FCM tokens with agent info
   * @throws Error if update fails
   */
  async updateFcmToken(payload: UpdateFcmTokenPayload): Promise<void> {
    try {
      console.log('[BackendService] Updating FCM token...');
      const response = await this.api.put('/api/devices/token', payload);
      console.log('[BackendService] FCM token updated successfully');
      console.log('[BackendService] Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[BackendService] Failed to update FCM token:', error);

      // Tratamento específico para Rate Limit (429)
      if (error.response?.status === 429) {
        console.warn('[BackendService] Rate limit atingido. Aguarde antes de tentar novamente.');
        throw new Error('Muitas tentativas. Aguarde um momento antes de tentar novamente.');
      }

      if (error.response) {
        console.error('[BackendService] Response data:', error.response.data);
        throw new Error(
          `Failed to update FCM token: ${error.response.data?.message || error.response.statusText}`,
        );
      }
      throw error;
    }
  }

  /**
   * Unregister device on logout
   *
   * When a user logs out, we should unregister the device from the backend
   * so they don't receive notifications for this instance anymore.
   *
   * Note: This doesn't throw errors - logout should proceed even if
   * backend unregistration fails.
   *
   * @param fcmToken - The FCM token to unregister
   */
  async unregisterDevice(fcmToken: string): Promise<void> {
    try {
      console.log('[BackendService] Unregistering device...');
      const response = await this.api.delete(`/api/devices/${fcmToken}`);
      console.log('[BackendService] Device unregistered successfully');
      console.log('[BackendService] Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[BackendService] Failed to unregister device:', error);

      // Tratamento específico para Rate Limit (429) - apenas log, não bloqueia logout
      if (error.response?.status === 429) {
        console.warn(
          '[BackendService] Rate limit atingido ao desregistrar dispositivo. Logout continuará.',
        );
      } else if (error.response) {
        console.error('[BackendService] Response data:', error.response.data);
      }
      // Don't throw - logout should proceed even if backend fails
    }
  }

  /**
   * Get API Access Token from backend
   *
   * The backend will fetch the API Access Token from Chatwoot using
   * the authentication token provided.
   *
   * @param payload - Chatwoot URL and authentication token
   * @returns API Access Token for integrations
   * @throws Error if token cannot be retrieved
   */
  async getApiAccessToken(payload: GetApiAccessTokenPayload): Promise<GetApiAccessTokenResponse> {
    try {
      console.log('[BackendService] Requesting API Access Token from backend...');
      console.log('[BackendService] Payload:', {
        chatwoot_url: payload.chatwoot_url,
        access_token: payload.access_token
          ? `${payload.access_token.substring(0, 10)}...`
          : 'missing',
      });

      const response = await this.api.post<GetApiAccessTokenResponse>(
        '/api/get-api-access-token',
        payload,
      );

      console.log('[BackendService] API Access Token retrieved successfully');
      console.log(
        '[BackendService] Token (first 20 chars):',
        response.data.api_access_token
          ? `${response.data.api_access_token.substring(0, 20)}...`
          : 'missing',
      );

      return response.data;
    } catch (error: any) {
      console.error('[BackendService] Failed to get API Access Token:', error);

      // Tratamento específico para Rate Limit (429)
      if (error.response?.status === 429) {
        console.warn('[BackendService] Rate limit atingido. Aguarde antes de tentar novamente.');
        throw new Error('Muitas tentativas. Aguarde um momento antes de tentar novamente.');
      }

      // Tratamento para erro 400 (token inválido)
      if (error.response?.status === 400) {
        const errorMessage =
          error.response?.data?.message ||
          'Token de acesso inválido. Por favor, faça login novamente.';
        throw new Error(errorMessage);
      }

      if (error.response) {
        console.error('[BackendService] Response data:', error.response.data);
        throw new Error(
          `Failed to get API Access Token: ${error.response.data?.message || error.response.statusText}`,
        );
      }

      throw error;
    }
  }

  /**
   * Verify if a Chatwoot instance is registered with NOTCHAT backend
   * 
   * @param chatwootUrl - The URL of the Chatwoot instance
   * @returns Promise with verification results
   */
  async verifyInstance(chatwootUrl: string): Promise<VerifyInstanceResponse> {
    try {
      console.log('[BackendService] Verifying instance registration:', chatwootUrl);
      const response = await this.api.get<VerifyInstanceResponse>('/api/verify-instance', {
        params: { chatwoot_url: chatwootUrl },
      });
      return response.data;
    } catch (error: any) {
      console.error('[BackendService] Failed to verify instance:', error);
      
      if (error.response?.status === 403 || error.response?.status === 404) {
        throw new Error(error.response.data?.message || `Instância não registrada no sistema ${BrandTokens.name}.`);
      }
      
      throw new Error('Erro ao validar a instância. Verifique sua conexão.');
    }
  }

  /**
   * Get the current backend URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}

// Export singleton instance
export const backendService = new BackendService();
