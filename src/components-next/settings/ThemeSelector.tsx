import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/context/ThemeContext';
import { Theme } from '@/types/common/Theme';

const SunIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2V4M12 20V22M4 12H2M6.31 6.31L4.9 4.9M17.69 6.31L19.1 4.9M6.31 17.69L4.9 19.1M17.69 17.69L19.1 19.1M22 12H20M17 12C17 14.76 14.76 17 12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const MoonIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PhoneIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 2H7C5.9 2 5 2.9 5 4V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V4C19 2.9 18.1 2 17 2ZM12 20C11.45 20 11 19.55 11 19C11 18.45 11.45 18 12 18C12.55 18 13 18.45 13 19C13 19.55 12.55 20 12 20ZM17 17H7V5H17V17Z"
      fill={color}
    />
  </Svg>
);

interface ThemeOption {
  value: Theme;
  icon: (color: string) => React.ReactNode;
}

const themeOptions: ThemeOption[] = [
  { value: 'light', icon: (color) => <SunIcon color={color} /> },
  { value: 'system', icon: (color) => <PhoneIcon color={color} /> },
  { value: 'dark', icon: (color) => <MoonIcon color={color} /> },
];

export const ThemeSelector: React.FC = () => {
  const { theme, setThemeMode, colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
      {themeOptions.map((option) => {
        const isSelected = theme === option.value;
        
        return (
          <Pressable
            key={option.value}
            onPress={() => setThemeMode(option.value)}
            style={[
              styles.option,
              isSelected && { backgroundColor: colors.primary },
            ]}
          >
            {option.icon(isSelected ? '#FFFFFF' : colors.icon)}
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'center',
    borderRadius: 10,
    borderWidth: 1,
    padding: 2,
  },
  option: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
});

export default ThemeSelector;
