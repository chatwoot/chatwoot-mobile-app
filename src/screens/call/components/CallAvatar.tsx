import React from 'react';
import { View } from 'react-native';

import { tailwind } from '@/theme';

import { CALL_TONES, type CallTone } from '../constants/callTheme';
import { CallerDisc } from './CallerDisc';
import { SonarDisc } from './SonarDisc';

export const CALL_AVATAR_SIZE = 132;

const SONAR_STAGGER_MS = 1600;

type CallAvatarProps = {
  name: string;
  uri?: string;
  tone: CallTone;
  // Discs swell outwards while a call is ringing
  aura?: boolean;
};

// The caller, large. A photo when there is one, otherwise the initial in the phase colour.
export const CallAvatar = ({ name, uri, tone, aura }: CallAvatarProps) => {
  const colours = CALL_TONES[tone];
  return (
    <View style={tailwind.style('h-[132px] w-[132px] items-center justify-center')}>
      {aura
        ? [0, 1].map(i => <SonarDisc key={i} colour={colours.sonar} delay={i * SONAR_STAGGER_MS} />)
        : null}
      <CallerDisc
        name={name}
        uri={uri}
        tone={tone}
        box="h-[132px] w-[132px]"
        text="text-[56px] leading-[64px]"
      />
    </View>
  );
};
