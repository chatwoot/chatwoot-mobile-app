import { Theme } from '@/types/common/Theme';

export type ColorScheme = 'light' | 'dark';

export const resolveColorScheme = (
  theme: Theme,
  systemColorScheme: string | null | undefined,
): ColorScheme => {
  if (theme === 'system') return systemColorScheme === 'dark' ? 'dark' : 'light';
  return theme;
};
