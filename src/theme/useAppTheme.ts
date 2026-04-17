import { useColorScheme } from 'react-native';
import { Theme } from '@/types/common/Theme';
import { useAppSelector } from '@/hooks';
import { selectTheme } from '@/store/settings/settingsSelectors';

export type AppColorScheme = 'light' | 'dark';

const appThemeColors = {
  light: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    border: 'rgba(0, 0, 0, 0.08)',
    card: '#FFFFFF',
    primary: '#1F93FF',
    text: '#1F1F1F',
  },
  dark: {
    background: '#1A1A1A',
    surface: '#262626',
    border: 'rgba(255, 255, 255, 0.12)',
    card: '#262626',
    primary: '#3E9EFF',
    text: '#EEEEEE',
  },
};

export const resolveColorScheme = (
  theme: Theme,
  systemColorScheme: AppColorScheme | null | undefined,
): AppColorScheme => {
  if (theme === 'system') {
    return systemColorScheme === 'dark' ? 'dark' : 'light';
  }

  return theme;
};

export const useAppTheme = () => {
  const theme = useAppSelector(selectTheme);
  const systemColorScheme = useColorScheme();
  const colorScheme = resolveColorScheme(theme, systemColorScheme);
  const isDark = colorScheme === 'dark';

  return {
    theme,
    colorScheme,
    isDark,
    colors: appThemeColors[colorScheme],
  };
};
