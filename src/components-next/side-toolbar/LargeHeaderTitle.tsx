import { useTailwind } from '@/theme/useTailwind';
import React from 'react';
import { Text } from 'react-native';

export const LargeHeaderTitle = ({ title }: { title: string }) => {
  const tailwind = useTailwind();
  return (
    <Text
      numberOfLines={1}
      accessibilityRole="header"
      style={tailwind.style(
        'flex-1 text-[28px] leading-[34px] font-inter-semibold-20 tracking-[0.2px] text-gray-950',
      )}>
      {title}
    </Text>
  );
};
