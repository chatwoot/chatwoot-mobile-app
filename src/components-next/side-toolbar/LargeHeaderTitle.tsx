import React from 'react';
import { Text } from 'react-native';

import { tailwind } from '@/theme';

// Left-aligned large title used in place of the centered title bar when header
// actions live in the side toolbar (iPhone Duo).
export const LargeHeaderTitle = ({ title }: { title: string }) => (
  <Text
    numberOfLines={1}
    accessibilityRole="header"
    style={tailwind.style(
      'flex-1 text-[28px] leading-[34px] font-inter-semibold-20 tracking-[0.2px] text-gray-950',
    )}>
    {title}
  </Text>
);
