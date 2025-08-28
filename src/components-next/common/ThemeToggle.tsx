import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { tailwind } from '@/theme';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { key: 'light', label: 'Light' },
    { key: 'dark', label: 'Dark' },
    { key: 'system', label: 'System' },
  ] as const;

  return (
    <View style={tailwind.style('flex-row bg-gray-100 rounded-lg p-1')}>
      {themes.map((themeOption) => (
        <TouchableOpacity
          key={themeOption.key}
          style={tailwind.style(
            theme === themeOption.key
              ? 'flex-1 py-2 px-3 rounded-md bg-white shadow-sm'
              : 'flex-1 py-2 px-3 rounded-md bg-transparent'
          )}
          onPress={() => setTheme(themeOption.key)}
        >
          <Text
            style={tailwind.style(
              theme === themeOption.key
                ? 'text-center text-sm font-medium text-blue-600'
                : 'text-center text-sm font-medium text-gray-600'
            )}
          >
            {themeOption.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
