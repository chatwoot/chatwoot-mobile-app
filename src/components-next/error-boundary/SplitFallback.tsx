import { Pressable, Text, View } from 'react-native';

import i18n from '@/i18n';
import { ErrorIcon } from '@/svg-icons';
import { tailwind } from '@/theme';
import type { FallbackProps } from './FallbackContent';

export const SplitFallback = ({ resetError }: FallbackProps) => (
  <View style={tailwind.style('flex-1 bg-gray-50 items-center justify-center px-8')}>
    <View style={tailwind.style('items-center gap-3 max-w-[320px]')}>
      <View style={tailwind.style('h-10 w-10 items-center justify-center')}>
        <View style={{ transform: [{ scale: 0.5 }] }}>
          <ErrorIcon />
        </View>
      </View>
      <Text
        style={tailwind.style(
          'text-[17px] leading-[22px] font-inter-semibold-20 text-gray-950 text-center',
        )}>
        {i18n.t('ERRORS.UNEXPECTED_TITLE')}
      </Text>
      <Text
        style={tailwind.style(
          'text-[15px] leading-[20px] font-inter-normal-20 text-gray-700 text-center',
        )}>
        {i18n.t('ERRORS.UNEXPECTED_DESCRIPTION')}
      </Text>
      <Pressable
        onPress={resetError}
        accessibilityRole="button"
        style={({ pressed }) =>
          tailwind.style(
            'mt-2 h-9 min-w-[88px] px-5 rounded-full items-center justify-center bg-blue-800',
            pressed && 'opacity-80',
          )
        }>
        <Text style={tailwind.style('text-[15px] font-inter-medium-24 text-white')}>
          {i18n.t('ERRORS.TRY_AGAIN')}
        </Text>
      </Pressable>
    </View>
  </View>
);
