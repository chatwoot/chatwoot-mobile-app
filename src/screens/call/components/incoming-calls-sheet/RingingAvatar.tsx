import React from 'react';

import { CallerDisc } from '../CallerDisc';

const SIZES = {
  large: { box: 'h-14 w-14', text: 'text-[24px] leading-[30px]' },
  row: { box: 'h-11 w-11', text: 'text-[19px] leading-6' },
};

type RingingAvatarProps = { name: string; uri?: string; size: keyof typeof SIZES };

export const RingingAvatar = ({ name, uri, size }: RingingAvatarProps) => (
  <CallerDisc name={name} uri={uri} tone="ringing" {...SIZES[size]} />
);
