import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { CheckGlyph } from '@/svg-icons';
import type { AudioRoute } from '@/services/voice/chatwootCalls';

import {
  CALL_INK,
  CALL_LINK,
  CALL_LINK_SOFT,
  CARD_SHADOW,
  CONTROL_OFF_GLYPH,
} from '../constants/callTheme';
import { AudioRouteIcon } from './AudioRouteIcon';

type AudioRoutePickerProps = {
  routes: AudioRoute[];
  current: AudioRoute;
  labelFor: (route: AudioRoute) => string;
  onSelect: (route: AudioRoute) => void;
};

// The list of places the call's audio can go, shown above the tray
export const AudioRoutePicker = ({
  routes,
  current,
  labelFor,
  onSelect,
}: AudioRoutePickerProps) => (
  <Animated.View
    entering={FadeInDown.duration(160)}
    exiting={FadeOutDown.duration(120)}
    style={[tailwind.style('rounded-[26px] bg-white pt-1.5 px-2 pb-2'), CARD_SHADOW]}>
    <View style={tailwind.style('self-center h-[5px] w-9 rounded-[3px] bg-[#CCCCCC] mt-1 mb-2')} />
    {routes.map(route => {
      const selected = route === current;
      return (
        <Pressable
          key={route}
          accessibilityRole="button"
          accessibilityState={{ selected }}
          onPress={() => onSelect(route)}
          style={[
            tailwind.style('h-[52px] rounded-2xl px-3.5 flex-row items-center gap-3.5'),
            selected ? { backgroundColor: CALL_LINK_SOFT } : null,
          ]}>
          <View style={tailwind.style('h-6 w-6 items-center justify-center')}>
            <AudioRouteIcon route={route} color={selected ? CALL_LINK : CONTROL_OFF_GLYPH} />
          </View>
          <Text
            numberOfLines={1}
            style={[
              tailwind.style('font-inter-420-20 text-[18px] leading-6 flex-1'),
              { color: selected ? CALL_LINK : CALL_INK },
            ]}>
            {labelFor(route)}
          </Text>
          {selected ? <CheckGlyph color={CALL_LINK} size={22} /> : null}
        </Pressable>
      );
    })}
  </Animated.View>
);
