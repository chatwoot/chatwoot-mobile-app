import { Platform, TextStyle } from 'react-native';

// TRIAL: system font on iOS.
export const USE_SYSTEM_FONT_ON_IOS = true;

export const useSystemFont = Platform.OS === 'ios' && USE_SYSTEM_FONT_ON_IOS;

const INTER_TO_SYSTEM_WEIGHT: Record<string, TextStyle['fontWeight']> = {
  'Inter-400-20': '400',
  'Inter-420-20': '400',
  'Inter-500-24': '500',
  'Inter-580-24': '600',
  'Inter-600-20': '600',
};

export const appFont = (interFontFile: string): TextStyle =>
  useSystemFont
    ? { fontFamily: 'System', fontWeight: INTER_TO_SYSTEM_WEIGHT[interFontFile] ?? '400' }
    : { fontFamily: interFontFile };
