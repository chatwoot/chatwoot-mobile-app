import React from 'react';
import { View } from 'react-native';

import { useTailwind } from '@/theme/useTailwind';

import { useCallTheme, type CallTone } from '../constants/callTheme';
import { CallerDisc } from './CallerDisc';
import { SonarDisc } from './SonarDisc';

export const CALL_AVATAR_SIZE = 132;

const SONAR_STAGGER_MS = 1600;

type CallAvatarProps = {
  name: string;
  hasName: boolean;
  uri?: string;
  tone: CallTone;
  aura?: boolean;
};

export const CallAvatar = ({ name, hasName, uri, tone, aura }: CallAvatarProps) => {
  const tailwind = useTailwind();
  const { CALL_TONES } = useCallTheme();
  const colours = CALL_TONES[tone];
  return (
    <View style={tailwind.style('h-[132px] w-[132px] items-center justify-center')}>
      {aura
        ? [0, 1].map(i => <SonarDisc key={i} colour={colours.sonar} delay={i * SONAR_STAGGER_MS} />)
        : null}
      <CallerDisc
        name={name}
        hasName={hasName}
        uri={uri}
        tone={tone}
        box="h-[132px] w-[132px]"
        text="text-[56px] leading-[64px]"
      />
    </View>
  );
};
