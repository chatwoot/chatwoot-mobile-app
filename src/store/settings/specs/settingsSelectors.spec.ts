import {
  selectSettings,
  selectInstallationUrl,
  selectLocale,
  selectIsLocaleSet,
  selectIsSettingUrl,
  selectBaseUrl,
  selectNotificationSettings,
  selectWebSocketUrl,
  selectTheme,
  selectIsChatwootCloud,
  selectShowSsoLogin,
  selectChatwootVersion,
  selectPushToken,
} from '@/store/settings/settingsSelectors';
import { RootState } from '@/store';

describe('Settings Selectors', () => {
  const baseMockState = {
    settings: {
      baseUrl: 'chatwoot.example.com',
      installationUrl: 'https://chatwoot.example.com/',
      uiFlags: {
        isSettingUrl: false,
        isUpdating: false,
        isLocaleSet: true,
      },
      localeValue: 'en',
      notificationSettings: {
        account_id: 1,
        all_email_flags: ['email_conversation_assignment'],
        all_push_flags: ['push_conversation_assignment'],
        id: 1,
        selected_email_flags: [],
        selected_push_flags: ['push_conversation_assignment'],
        user_id: 1,
      },
      webSocketUrl: 'wss://chatwoot.example.com/cable',
      theme: 'system' as const,
      version: 'v4.11.5',
      pushToken: 'sample_token_123',
    },
  } as unknown as RootState;

  it('should select entire settings state', () => {
    expect(selectSettings(baseMockState)).toEqual(baseMockState.settings);
  });

  it('should select installationUrl', () => {
    expect(selectInstallationUrl(baseMockState)).toBe('https://chatwoot.example.com/');
  });

  it('should select baseUrl', () => {
    expect(selectBaseUrl(baseMockState)).toBe('chatwoot.example.com');
  });

  it('should select webSocketUrl', () => {
    expect(selectWebSocketUrl(baseMockState)).toBe('wss://chatwoot.example.com/cable');
  });

  it('should select theme', () => {
    expect(selectTheme(baseMockState)).toBe('system');
  });

  it('should select chatwoot version', () => {
    expect(selectChatwootVersion(baseMockState)).toBe('v4.11.5');
  });

  it('should select push token', () => {
    expect(selectPushToken(baseMockState)).toBe('sample_token_123');
  });

  it('should select isLocaleSet flag', () => {
    expect(selectIsLocaleSet(baseMockState)).toBe(true);
  });

  it('should select isSettingUrl flag', () => {
    expect(selectIsSettingUrl(baseMockState)).toBe(false);
  });

  it('should select notification settings', () => {
    expect(selectNotificationSettings(baseMockState)).toEqual(
      baseMockState.settings.notificationSettings,
    );
  });

  describe('selectLocale', () => {
    it('returns locale value when not zh', () => {
      expect(selectLocale(baseMockState)).toBe('en');
    });

    it('maps zh to zh_CN', () => {
      const stateWithZh = {
        settings: {
          ...baseMockState.settings,
          localeValue: 'zh',
        },
      } as unknown as RootState;
      expect(selectLocale(stateWithZh)).toBe('zh_CN');
    });
  });

  describe('selectIsChatwootCloud', () => {
    it('returns false for self-hosted installations', () => {
      expect(selectIsChatwootCloud(baseMockState)).toBe(false);
    });

    it('returns true when installationUrl contains app.chatwoot.com', () => {
      const cloudState = {
        settings: {
          ...baseMockState.settings,
          installationUrl: 'https://app.chatwoot.com/',
        },
      } as unknown as RootState;
      expect(selectIsChatwootCloud(cloudState)).toBe(true);
    });
  });

  describe('selectShowSsoLogin', () => {
    it('returns true for cloud installations', () => {
      const cloudState = {
        settings: {
          ...baseMockState.settings,
          installationUrl: 'https://app.chatwoot.com/',
        },
      } as unknown as RootState;
      expect(selectShowSsoLogin(cloudState)).toBe(true);
    });

    it('returns true for self-hosted installations with configured URL', () => {
      const selfHostedState = {
        settings: {
          ...baseMockState.settings,
          installationUrl: 'https://my-chatwoot.instance.org/',
        },
      } as unknown as RootState;
      expect(selectShowSsoLogin(selfHostedState)).toBe(true);
    });

    it('returns false when installationUrl is empty string', () => {
      const emptyState = {
        settings: {
          ...baseMockState.settings,
          installationUrl: '',
        },
      } as unknown as RootState;
      expect(selectShowSsoLogin(emptyState)).toBe(false);
    });
  });
});
