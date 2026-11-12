import { useTailwind } from '@/theme/useTailwind';
import React from 'react';
import { Text, View } from 'react-native';

import { useSideTabBarLayout } from '@/utils';

export const PaneHeader = ({
  title,
  left,
  right,
}: {
  title: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
}) => {
  const tailwind = useTailwind();
  const sideTabBar = useSideTabBarLayout();
  const slot = !left && !right ? 'w-0' : right ? 'w-24' : 'w-11';
  return (
    <View style={{ paddingTop: sideTabBar?.contentTopPadding ?? 0 }}>
      <View style={tailwind.style('flex flex-row items-center px-4 pt-1 pb-3')}>
        <View style={tailwind.style(slot, 'h-9 flex-row items-center justify-start')}>{left}</View>
        <Text
          numberOfLines={1}
          accessibilityRole="header"
          style={tailwind.style(
            'flex-1 text-[17px] text-center leading-[22px] font-inter-medium-24 text-gray-950',
          )}>
          {title}
        </Text>
        <View style={tailwind.style(slot, 'h-9 flex-row items-center justify-end')}>{right}</View>
      </View>
    </View>
  );
};
