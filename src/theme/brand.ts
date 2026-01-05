import Constants from 'expo-constants';

/**
 * Brand Configuration System
 * 
 * To customize for a client build, set these Environment Variables:
 * - EXPO_PUBLIC_PRIMARY_COLOR (default: #1FB6FF)
 * - EXPO_PUBLIC_SECONDARY_COLOR (default: #0084FF)
 * - EXPO_PUBLIC_APP_NAME (default: Notchat)
 */

const extra = Constants.expoConfig?.extra || {};

export const BrandTokens = {
  name: extra.appName || 'Notchat',
  version: extra.minChatwootVersion || '2.7.0',
  colors: {
    primary: extra.primaryColor || '#1FB6FF',
    secondary: extra.secondaryColor || '#0084FF',
    accent: extra.accentColor || '#FF3B30',
    background: '#FFFFFF',
    text: '#1F2937',
    textMuted: '#6B7280',
    border: '#E5E7EB',
  },
};

export default BrandTokens;
