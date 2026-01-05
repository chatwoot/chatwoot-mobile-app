import { Theme } from '@/types/common/Theme';
import * as RootNavigation from '@/utils/navigationUtils';
import { createSlice } from '@reduxjs/toolkit';
import { settingsActions } from './settingsActions';
import { NotificationSettings } from './settingsTypes';

interface SettingsState {
  baseUrl: string;
  installationUrl: string;
  uiFlags: {
    isSettingUrl: boolean;
    isUpdating: boolean;
    isLocaleSet: boolean;
  };
  notificationSettings: NotificationSettings;
  localeValue: string;
  webSocketUrl: string;
  theme: Theme;
  version: string;
  pushToken: string;
  isTokenValid: boolean; // Adicionar estado para token válido
}
const initialState: SettingsState = {
  baseUrl: 'app.chatwoot.com',
  installationUrl: 'https://app.chatwoot.com/',
  uiFlags: {
    isSettingUrl: false,
    isUpdating: false,
    isLocaleSet: false,
  },
  localeValue: 'en',
  notificationSettings: {
    account_id: 0,
    all_email_flags: [],
    all_push_flags: [],
    id: 0,
    selected_email_flags: [],
    selected_push_flags: [],
    user_id: 0,
  },
  webSocketUrl: 'wss://app.chatwoot.com/cable',
  theme: 'system',
  version: '',
  pushToken: '',
  isTokenValid: true, // Iniciar como true, será atualizado após validação
};
export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    resetSettings: state => {
      state.uiFlags.isSettingUrl = false;
      state.uiFlags.isUpdating = false;
      state.isTokenValid = true; // Resetar para true no reset
    },
    setLocale: (state, action) => {
      state.localeValue = action.payload;
      state.uiFlags.isLocaleSet = true;
    },
    setTokenValid: (state, action) => {
      state.isTokenValid = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(settingsActions.setInstallationUrl.pending, state => {
        state.uiFlags.isSettingUrl = true;
      })
      .addCase(settingsActions.setInstallationUrl.fulfilled, (state, action) => {
        state.uiFlags.isSettingUrl = false;
        state.installationUrl = action.payload.installationUrl;
        state.baseUrl = action.payload.baseUrl;
        state.webSocketUrl = action.payload.webSocketUrl;
        RootNavigation.navigate('Login');
      })
      .addCase(settingsActions.setInstallationUrl.rejected, state => {
        state.uiFlags.isSettingUrl = false;
        state.installationUrl = '';
        state.baseUrl = '';
      })
      .addCase(settingsActions.getNotificationSettings.fulfilled, (state, action) => {
        state.notificationSettings = action.payload;
      })
      .addCase(settingsActions.updateNotificationSettings.pending, state => {
        state.uiFlags.isUpdating = true;
      })
      .addCase(settingsActions.updateNotificationSettings.fulfilled, (state, action) => {
        state.uiFlags.isUpdating = false;
        state.notificationSettings = action.payload;
      })
      .addCase(settingsActions.updateNotificationSettings.rejected, state => {
        state.uiFlags.isUpdating = false;
      })
      .addCase(settingsActions.getAppVersion.fulfilled, (state, action) => {
        const { version } = action.payload;
        state.version = version;
      })
      .addCase(settingsActions.saveDeviceDetails.fulfilled, (state, action) => {
        if (action?.payload?.fcmToken) {
          state.pushToken = action.payload.fcmToken;
        }
        state.isTokenValid = true; // Token é válido se o registro foi bem-sucedido
      })
      .addCase(settingsActions.saveDeviceDetails.rejected, (state, action) => {
        // Não limpar pushToken se for erro de rate limit - mantém o token existente
        const errorMessage = action.payload as string;
        if (errorMessage && errorMessage.includes('Rate limit')) {
          // Manter o pushToken existente em caso de rate limit
          return;
        }

        // Verificar se é erro de token inválido
        const isTokenError =
          typeof errorMessage === 'string' &&
          (errorMessage.includes('token inválido') ||
            errorMessage.includes('token não autorizado') ||
            errorMessage.includes('configure o token') ||
            errorMessage.includes('Access token inválido'));

        if (isTokenError) {
          state.isTokenValid = false; // Marcar token como inválido
        } else {
          // Limpar apenas em outros tipos de erro
          state.pushToken = '';
        }
      });
  },
});
export const { resetSettings, setLocale, setTokenValid } = settingsSlice.actions;
export default settingsSlice.reducer;
