import React from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';

import { Icon } from '@/components-next/common/icon';
import { CloseIcon, SearchIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import i18n from 'i18n';

const useLiquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();
const HEIGHT = 44;

type IOSSearchFieldProps = {
  value: string;
  isLoading: boolean;
  onChangeText: (text: string) => void;
  onClear: () => void;
};

// Search field in the same glass capsule as the reply bar's text field (44pt, 17pt text),
// with the system search field's magnifier, clear button and a spinner while loading.
export const IOSSearchField = ({
  value,
  isLoading,
  onChangeText,
  onClear,
}: IOSSearchFieldProps) => (
  <View
    style={tailwind.style(
      `flex-1 h-[${HEIGHT}px] flex-row items-center rounded-full pl-3.5 pr-2.5`,
      useLiquidGlass ? '' : 'bg-white border-[0.5px] border-blackA-A6',
    )}>
    {useLiquidGlass ? (
      <GlassView
        glassEffectStyle="regular"
        isInteractive
        style={[StyleSheet.absoluteFill, { borderRadius: HEIGHT / 2 }]}
      />
    ) : null}
    <Icon icon={<SearchIcon stroke={tailwind.color('text-gray-700')} />} size={17} />
    <TextInput
      autoFocus
      value={value}
      onChangeText={onChangeText}
      placeholder={i18n.t('SEARCH.PLACEHOLDER')}
      placeholderTextColor={tailwind.color('text-gray-700')}
      autoCapitalize="none"
      autoCorrect={false}
      returnKeyType="search"
      clearButtonMode="never"
      // Single-line inputs center their text; a lineHeight would push it off center.
      style={tailwind.style(
        'flex-1 h-full ml-1.5 py-0 text-[17px] font-inter-normal-20 text-gray-950',
      )}
    />
    {isLoading ? (
      <ActivityIndicator size="small" style={tailwind.style('ml-1')} />
    ) : value ? (
      <Pressable
        onPress={onClear}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={i18n.t('SEARCH.CLEAR_ALL')}
        style={tailwind.style(
          'ml-1 h-[18px] w-[18px] rounded-full bg-gray-600 items-center justify-center',
        )}>
        <Icon icon={<CloseIcon stroke="white" strokeWidth={3} />} size={10} />
      </Pressable>
    ) : null}
  </View>
);
