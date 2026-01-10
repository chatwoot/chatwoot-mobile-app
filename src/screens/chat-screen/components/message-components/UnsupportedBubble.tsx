import React from 'react';
import { View, Text } from 'react-native';
import { tailwind } from '@/theme';
import i18n from '@/i18n';
import { useTheme } from '@/context/ThemeContext';

export const UnsupportedBubble = () => {
  try {
    const { colors, isDark } = useTheme();
    return (
      <View
        style={[
          tailwind.style(
            'px-4 py-3 border border-dashed border-amber-700 rounded-lg',
          ),
          { backgroundColor: isDark ? colors.card : tailwind.color('bg-amber-100') },
        ]}>
        <Text style={[tailwind.style('text-gray-950'), isDark && { color: colors.textSecondary }]}>
          {i18n.t('CONVERSATION.UNSUPPORTED_MESSAGE')}
        </Text>
      </View>
    );
  } catch (error) {
    console.error('[UnsupportedBubble] Render error:', error);
    return <View style={{ height: 0 }} />;
  }
};
