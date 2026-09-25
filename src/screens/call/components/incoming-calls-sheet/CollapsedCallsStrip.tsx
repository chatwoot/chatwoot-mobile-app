import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tailwind } from '@/theme';
import i18n from '@/i18n';

import { solidSurface } from '../../constants/callTheme';
import { GlassSurface } from '../GlassSurface';
import { PulseDot } from '../PulseDot';

// The strip above the tray once the sheet is put away: how many still ring, and a way back
export const CollapsedCallsStrip = ({ label, onPress }: { label: string; onPress: () => void }) => {
  const insets = useSafeAreaInsets();
  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      exiting={FadeOut.duration(140)}
      style={[tailwind.style('absolute left-4 right-4'), { bottom: insets.bottom + 176 }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}>
        <GlassSurface
          style={tailwind.style(
            'h-[52px] rounded-[18px] pl-[18px] pr-4 flex-row items-center justify-between',
          )}
          fallbackStyle={solidSurface(18, 'card')}>
          <View style={tailwind.style('flex-row items-center gap-[9px]')}>
            <PulseDot />
            <Text style={tailwind.style('font-inter-580-24 text-[15px] leading-5 text-gray-950')}>
              {label}
            </Text>
          </View>
          <Text style={tailwind.style('font-inter-medium-24 text-[15px] leading-5 text-blue-800')}>
            {i18n.t('CONVERSATION.VOICE_WIDGET.VIEW')}
          </Text>
        </GlassSurface>
      </Pressable>
    </Animated.View>
  );
};
