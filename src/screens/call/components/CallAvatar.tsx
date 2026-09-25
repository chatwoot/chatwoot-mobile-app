import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Defs, LinearGradient, Rect, Stop, Svg } from 'react-native-svg';

import { tailwind } from '@/theme';
import { removeEmoji } from '@/components-next/common/avatar/Avatar';

import { CALL_TONES, type CallTone } from '../constants/callTheme';
import { SonarDisc } from './SonarDisc';

export const CALL_AVATAR_SIZE = 132;

const SONAR_STAGGER_MS = 1600;

type CallAvatarProps = {
  name: string;
  uri?: string;
  tone: CallTone;
  // Discs swell outwards while a call is ringing or being placed
  aura?: boolean;
};

// The caller, large. A photo when there is one, otherwise the initial on a gradient in
// the phase colour.
export const CallAvatar = ({ name, uri, tone, aura }: CallAvatarProps) => {
  const colours = CALL_TONES[tone];
  const initial = removeEmoji(name).trim().charAt(0).toUpperCase() || '?';
  return (
    <View style={tailwind.style('h-[132px] w-[132px] items-center justify-center')}>
      {aura
        ? [0, 1].map(i => <SonarDisc key={i} colour={colours.sonar} delay={i * SONAR_STAGGER_MS} />)
        : null}
      <View style={[styles.circle, { shadowColor: colours.wash }]}>
        <View
          style={tailwind.style(
            'h-[132px] w-[132px] rounded-full overflow-hidden items-center justify-center',
          )}>
          <Svg
            width={CALL_AVATAR_SIZE}
            height={CALL_AVATAR_SIZE}
            style={tailwind.style('absolute inset-0')}>
            <Defs>
              <LinearGradient id="avatarFill" x1="0" y1="0" x2="0.6" y2="1">
                <Stop offset="0" stopColor={colours.avatarFrom} />
                <Stop offset="1" stopColor={colours.avatarTo} />
              </LinearGradient>
            </Defs>
            <Rect width={CALL_AVATAR_SIZE} height={CALL_AVATAR_SIZE} fill="url(#avatarFill)" />
          </Svg>
          <Text
            style={[
              tailwind.style('font-inter-580-24 text-[56px] leading-[64px]'),
              { color: colours.avatarInk },
            ]}>
            {initial}
          </Text>
          {uri ? (
            // The photo sits over the initial and stays in the image cache across remounts
            <Image
              source={{ uri }}
              cachePolicy="memory-disk"
              transition={0}
              style={tailwind.style('absolute inset-0')}
              contentFit="cover"
            />
          ) : null}
        </View>
        <View
          style={tailwind.style(
            'absolute inset-0 rounded-full border-t border-[rgba(255,255,255,0.8)]',
          )}
          pointerEvents="none"
        />
      </View>
    </View>
  );
};

// A soft drop shadow in the phase colour under the avatar
const styles = StyleSheet.create({
  circle: {
    width: CALL_AVATAR_SIZE,
    height: CALL_AVATAR_SIZE,
    borderRadius: CALL_AVATAR_SIZE / 2,
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
});
