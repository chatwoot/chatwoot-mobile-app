import React from 'react';
import { Pressable, Text, View } from 'react-native';
import i18n from '@/i18n';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectTheme } from '@/store/settings/settingsSelectors';
import { setTheme } from '@/store/settings/settingsSlice';
import { Theme } from '@/types/common/Theme';
import { useTailwind } from '@/theme/useTailwind';

export const AppearancePicker = () => {
  const tailwind = useTailwind();
  const dispatch = useAppDispatch();
  const selected = useAppSelector(selectTheme) ?? 'system';
  return (
    <View accessibilityRole="radiogroup">
      {(['system', 'light', 'dark'] as Theme[]).map((theme, index) => (
        <Pressable
          key={theme}
          accessibilityRole="radio"
          accessibilityState={{ checked: selected === theme }}
          onPress={() => dispatch(setTheme(theme))}
          style={({ pressed }) =>
            tailwind.style('px-4 py-3 flex-row items-center', pressed && 'bg-gray-100')
          }>
          <Text style={tailwind.style('flex-1 text-base font-inter-420-20 text-gray-950')}>
            {i18n.t(`SETTINGS.APPEARANCE_${theme.toUpperCase()}`)}
          </Text>
          {selected === theme ? (
            <Text style={tailwind.style('text-blue-900 text-lg')}>✓</Text>
          ) : null}
          {index < 2 ? (
            <View style={tailwind.style('absolute bottom-0 left-4 right-0 h-px bg-gray-200')} />
          ) : null}
        </Pressable>
      ))}
      <Text style={tailwind.style('px-4 py-3 text-sm text-gray-900')}>
        {i18n.t('SETTINGS.APPEARANCE_SYSTEM_DESCRIPTION')}
      </Text>
    </View>
  );
};
