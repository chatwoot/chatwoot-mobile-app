import React from 'react';
import { Text } from 'react-native';

import { tailwind } from '@/theme';
import { Avatar, getInitials } from '@/components-next/common/avatar/Avatar';

import { CALL_TONES, type CallTone } from '../constants/callTheme';

type CallerDiscProps = {
  name: string;
  uri?: string;
  tone: CallTone;
  box: string;
  text: string;
};

const IMAGE_PROPS = { cachePolicy: 'memory-disk', transition: 0, contentFit: 'cover' } as const;

export const CallerDisc = ({ name, uri, tone, box, text }: CallerDiscProps) => {
  const colours = CALL_TONES[tone];
  const initials = getInitials(name) || '?';
  return (
    // Avatar checks its image once, so a photo that arrives later remounts it
    <Avatar
      key={uri ?? ''}
      src={uri ? { uri } : undefined}
      imageProps={IMAGE_PROPS}
      fallback={
        <Text style={[tailwind.style('font-inter-580-24', text), { color: colours.avatarInk }]}>
          {initials}
        </Text>
      }
      style={[tailwind.style(box, 'overflow-hidden'), { backgroundColor: colours.avatarFill }]}
    />
  );
};
