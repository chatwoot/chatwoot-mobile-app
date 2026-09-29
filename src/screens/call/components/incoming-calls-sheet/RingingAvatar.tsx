import React from 'react';
import { Text, View } from 'react-native';
import { Image } from 'expo-image';

import { tailwind } from '@/theme';
import { removeEmoji } from '@/components-next/common/avatar/Avatar';

import { CALL_TONES } from '../../constants/callTheme';

const SIZES = {
  // The single caller's header block
  large: { box: 'h-14 w-14', text: 'text-[24px] leading-[30px]' },
  // A row in the list of several
  row: { box: 'h-11 w-11', text: 'text-[19px] leading-6' },
};

type RingingAvatarProps = { name: string; uri?: string; size: keyof typeof SIZES };

// A ringing caller: the photo when there is one, otherwise the initial in the ringing colours
export const RingingAvatar = ({ name, uri, size }: RingingAvatarProps) => {
  const { box, text } = SIZES[size];
  const initial = removeEmoji(name).trim().charAt(0).toUpperCase() || '?';
  return (
    <View
      style={[
        tailwind.style(box, 'rounded-full overflow-hidden items-center justify-center'),
        { backgroundColor: CALL_TONES.ringing.avatarFill },
      ]}>
      <Text
        style={[
          tailwind.style('font-inter-580-24', text),
          { color: CALL_TONES.ringing.avatarInk },
        ]}>
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
