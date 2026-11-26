import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTailwind } from '@/theme/useTailwind';
import i18n from '@/i18n';

import {
  CALL_CONTENT_MAX_WIDTH,
  CALL_STRIP_GAP,
  CALL_STRIP_HEIGHT,
  CALL_TRAY_HEIGHT,
  callTrayBottom,
  callTrayInset,
  CARD_SHADOW,
  useCallTheme,
} from '../../constants/callTheme';
import { CALL_GLASS, CallSurface } from '../CallSurface';
import { PulseDot } from '../PulseDot';

export const CollapsedCallsStrip = ({ label, onPress }: { label: string; onPress: () => void }) => {
  const tailwind = useTailwind();
  const { CALL_INK, CALL_LINK } = useCallTheme();
  const insets = useSafeAreaInsets();
  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      exiting={FadeOut.duration(140)}
      style={[
        tailwind.style('absolute items-center'),
        {
          left: callTrayInset(insets),
          right: callTrayInset(insets),
          bottom: callTrayBottom(insets.bottom) + CALL_TRAY_HEIGHT + CALL_STRIP_GAP,
        },
      ]}
      pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        style={[
          tailwind.style('w-full', CALL_GLASS ? 'px-4' : ''),
          { maxWidth: CALL_CONTENT_MAX_WIDTH },
        ]}>
        <CallSurface
          radius={18}
          shadow={CARD_SHADOW}
          interactive
          style={[
            tailwind.style('pl-[18px] pr-4 flex-row items-center justify-between'),
            { height: CALL_STRIP_HEIGHT },
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
        </CallSurface>
      </Pressable>
    </Animated.View>
  );
};
