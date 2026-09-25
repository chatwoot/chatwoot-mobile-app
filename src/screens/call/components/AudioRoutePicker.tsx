import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { CheckGlyph } from '@/svg-icons';
import type { AudioRoute } from '@/services/voice/chatwootCalls';

import { CALL_GLYPH_OFF, CALL_INK, CALL_LINK, solidSurface } from '../constants/callTheme';
import { AudioRouteListIcon } from './AudioRouteIcon';
import { GlassSurface } from './GlassSurface';

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
  <Animated.View entering={FadeInDown.duration(160)} exiting={FadeOutDown.duration(120)}>
    <GlassSurface
      style={tailwind.style('rounded-[26px] pt-1.5 px-2 pb-2')}
      fallbackStyle={solidSurface(26, 'card')}>
      <View
        style={tailwind.style('self-center h-[5px] w-9 rounded-[3px] bg-[#CCCCCC] mt-1 mb-2')}
      />
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
              selected ? tailwind.style('bg-[rgba(11,126,217,0.1)]') : null,
            ]}>
            <View style={tailwind.style('h-6 w-6 items-center justify-center')}>
              <AudioRouteListIcon route={route} color={selected ? CALL_LINK : CALL_GLYPH_OFF} />
            </View>
            <Text
              numberOfLines={1}
              style={[
                tailwind.style('font-inter-420-20 text-[18px] leading-6 flex-1'),
                { color: selected ? CALL_LINK : CALL_INK },
              ]}>
              {labelFor(route)}
            </Text>
            {selected ? (
              <View style={tailwind.style('h-[22px] w-[22px]')}>
                <CheckGlyph color={CALL_LINK} />
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </GlassSurface>
  </Animated.View>
);
