import { createContext, useContext } from 'react';
import { Theme } from '@/types/common/Theme';
import { ColorScheme } from '@/utils/themeUtils';

export type ThemeContextType = {
  theme: Theme;
  colorScheme: ColorScheme;
  isDark: boolean;
  changeTheme: (newTheme: Theme) => void;
};

// Outside a ThemeProvider (isolated component tests, Storybook) components render the light theme.
export const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  colorScheme: 'light',
  isDark: false,
  changeTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);
