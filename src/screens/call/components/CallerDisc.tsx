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
  // Tailwind classes for the disc's size and the initial's type size
  box: string;
  text: string;
};

// A caller's photo when there is one, otherwise their initial in the phase colours. The
// photo sits over the initial and stays in the image cache across remounts.
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
