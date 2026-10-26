import React from 'react';
import { Text, View } from 'react-native';
import { Image } from 'expo-image';

import { tailwind } from '@/theme';
import { removeEmoji } from '@/components-next/common/avatar/Avatar';

import { CALL_TONES, type CallTone } from '../constants/callTheme';

type CallerDiscProps = {
  name: string;
  uri?: string;
  tone: CallTone;
  box: string;
  text: string;
};

export const CallerDisc = ({ name, uri, tone, box, text }: CallerDiscProps) => {
  const colours = CALL_TONES[tone];
  const initial = removeEmoji(name).trim().charAt(0).toUpperCase() || '?';
  return (
    <View
      style={[
        tailwind.style(box, 'rounded-full overflow-hidden items-center justify-center'),
        { backgroundColor: colours.avatarFill },
      ]}>
      <Text style={[tailwind.style('font-inter-580-24', text), { color: colours.avatarInk }]}>
        {initial}
      </Text>
      {uri ? (
        <Image
          source={{ uri }}
          cachePolicy="memory-disk"
          transition={0}
          style={tailwind.style('absolute inset-0')}
          contentFit="cover"
        />
      ) : null}
    </View>
  );
};
