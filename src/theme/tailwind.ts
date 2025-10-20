import { create } from 'twrnc';
import { twConfig } from './tailwind.config';

// Create the base tailwind instance
export const tailwind = create(twConfig);

// Create a function that returns theme-aware styles
export const createThemedTailwind = (isDark: boolean) => {
  return create({
    ...twConfig,
    theme: {
      ...twConfig.theme,
      extend: {
        ...twConfig.theme.extend,
        colors: {
          ...twConfig.theme.extend.colors,
          // Override base colors with theme-specific ones
          background: isDark ? 'rgb(27, 27, 27)' : '#FFFFFF', // Matching LoginScreen exactly
          foreground: isDark ? '#FFFFFF' : '#000000',
          // Add semantic color mappings
          primary: isDark
            ? twConfig.theme.extend.colors.brandDark
            : twConfig.theme.extend.colors.brand,
          secondary: isDark
            ? twConfig.theme.extend.colors.grayDark
            : twConfig.theme.extend.colors.gray,
          muted: isDark
            ? twConfig.theme.extend.colors.slateDark
            : twConfig.theme.extend.colors.slate,
          accent: isDark
            ? twConfig.theme.extend.colors.blueDark
            : twConfig.theme.extend.colors.blue,
        },
      },
    },
  });
};
