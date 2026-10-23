import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tailwind } from '@/theme';
import i18n from '@/i18n';

import {
  CALL_INK,
  CALL_LINK,
  CALL_TRAY_HEIGHT,
  CARD_SHADOW,
  callTrayBottom,
} from '../../constants/callTheme';
import { PulseDot } from '../PulseDot';

// Space between the top of the tray and the strip
const STRIP_GAP = 14;

// The strip above the tray once the sheet is put away: how many still ring, and a way back
export const CollapsedCallsStrip = ({ label, onPress }: { label: string; onPress: () => void }) => {
  const insets = useSafeAreaInsets();
  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      exiting={FadeOut.duration(140)}
      style={[
        tailwind.style('absolute left-5 right-5'),
        { bottom: callTrayBottom(insets.bottom) + CALL_TRAY_HEIGHT + STRIP_GAP },
      ]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        style={[
          tailwind.style(
            'h-[52px] rounded-[18px] bg-white pl-[18px] pr-4 flex-row items-center justify-between',
          ),
          CARD_SHADOW,
        ]}>
        <View style={tailwind.style('flex-row items-center gap-[9px]')}>
          <PulseDot />
          <Text
            style={[
              tailwind.style('font-inter-580-24 text-[15px] leading-5'),
              { color: CALL_INK },
            ]}>
            {label}
          </Text>
        </View>
        <Text
          style={[
            tailwind.style('font-inter-medium-24 text-[15px] leading-5'),
            { color: CALL_LINK },
          ]}>
          {i18n.t('CONVERSATION.VOICE_WIDGET.VIEW')}
        </Text>
      </Pressable>
    </Animated.View>
  );
};
