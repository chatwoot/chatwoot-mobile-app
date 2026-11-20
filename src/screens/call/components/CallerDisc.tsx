import React from 'react';
import { Text, View } from 'react-native';

import { useTailwind } from '@/theme/useTailwind';
import { Avatar, getInitials } from '@/components-next/common/avatar/Avatar';
import { UserIcon } from '@/svg-icons';

import { useCallTheme, type CallTone } from '../constants/callTheme';

type CallerDiscProps = {
  name: string;
  hasName: boolean;
  uri?: string;
  tone: CallTone;
  box: string;
  text: string;
};

const IMAGE_PROPS = { cachePolicy: 'memory-disk', transition: 0, contentFit: 'cover' } as const;

export const CallerDisc = ({ name, hasName, uri, tone, box, text }: CallerDiscProps) => {
  const tailwind = useTailwind();
  const { CALL_TONES } = useCallTheme();
  const colours = CALL_TONES[tone];
  const initials = getInitials(name) || '?';
  return (
    // Avatar checks its image once, so a photo that arrives later remounts it
    <Avatar
      key={uri ?? ''}
      src={uri ? { uri } : undefined}
      imageProps={IMAGE_PROPS}
      fallback={
        hasName ? (
          <Text style={[tailwind.style('font-inter-580-24', text), { color: colours.avatarInk }]}>
            {initials}
          </Text>
        ) : (
          <View style={tailwind.style('w-[45%] aspect-square')}>
            <UserIcon stroke={colours.avatarInk} />
          </View>
        )
      }
      style={[tailwind.style(box, 'overflow-hidden'), { backgroundColor: colours.avatarFill }]}
    />
  );
};
