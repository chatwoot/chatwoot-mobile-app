import { useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { tailwind } from '@/theme/tailwind';

export const useThemedStyles = () => {
  const { isDark } = useTheme();

  // Return an object with theme-aware style methods
  return useMemo(
    () => ({
      style: (...classes: (string | undefined | false)[]) => {
        // Join all classes into a single string, filtering out falsy values
        const allClasses = classes.filter(Boolean).join(' ');
        // Apply theme-specific transformations to classes
        let themedClasses = allClasses;

        if (isDark) {
          // Transform common light mode classes to dark mode equivalents
          // Using grayDark-50 to match LoginScreen
          themedClasses = themedClasses
            .replace(/bg-white/g, 'bg-grayDark-50') // Main backgrounds - matching LoginScreen
            .replace(/bg-gray-50/g, 'bg-gray-900') // Secondary backgrounds - very dark gray
            .replace(/bg-gray-100/g, 'bg-gray-800') // Card backgrounds - dark gray
            .replace(/text-gray-950/g, 'text-white') // Primary text - pure white
            .replace(/text-gray-900/g, 'text-gray-100') // Secondary text - light gray
            .replace(/text-gray-800/g, 'text-gray-200') // Medium text - light gray
            .replace(/text-gray-700/g, 'text-gray-300') // Tertiary text - medium gray
            .replace(/text-gray-400/g, 'text-gray-500') // Placeholder text - medium gray
            .replace(/text-black/g, 'text-white') // Pure black to white
            .replace(/border-gray-200/g, 'border-gray-700') // Borders - dark gray
            .replace(/border-gray-300/g, 'border-gray-600') // Stronger borders
            .replace(/border-white/g, 'border-gray-700') // White borders to dark
            .replace(/border-b-blackA-A3/g, 'border-b-gray-700') // BlackA borders to gray
            .replace(/border-blackA-A3/g, 'border-gray-700') // BlackA borders to gray (without -b)
            .replace(/border-b-gray-200/g, 'border-b-gray-700'); // More border transformations

          // Debug log to see what's happening
          console.log('Dark mode transformation:', {
            original: allClasses,
            transformed: themedClasses,
            isDark: true,
          });
        } else {
          // Light mode - keep original styling, no transformations needed for blackA borders
          // The original blackA-A3 borders should remain as-is for the subtle original look

          // Debug log to see what's happening in light mode
          if (allClasses.includes('blackA')) {
            console.log('Light mode - keeping original styling:', {
              original: allClasses,
              transformed: themedClasses,
              isDark: false,
            });
          }
        }

        return tailwind.style(themedClasses);
      },
      color: (colorClass: string) => {
        let themedColorClass = colorClass;

        if (isDark) {
          themedColorClass = themedColorClass
            .replace(/bg-white/g, 'bg-grayDark-50')
            .replace(/text-black/g, 'text-white');
        }

        return tailwind.color(themedColorClass);
      },
    }),
    [isDark],
  );
};

// Convenience function for theme-aware styling
export const useThemeAwareStyle = (lightStyle: string, darkStyle?: string) => {
  const { isDark } = useTheme();
  const themedTailwind = useThemedStyles();

  return useMemo(() => {
    const style = isDark && darkStyle ? darkStyle : lightStyle;
    return themedTailwind(style);
  }, [isDark, lightStyle, darkStyle, themedTailwind]);
};
