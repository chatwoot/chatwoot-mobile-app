import React from 'react';
import { Text, View } from 'react-native';

import { tailwind } from '@/theme';
import { useSideTabBarLayout } from '@/utils';

// Header for split view panes and columns (iPhone Duo), matching the list headers: the same
// top margin, a 36pt row with a small centered title, and no divider. Actions live in the
// side toolbar, so the side slots stay empty to keep the title centered.
export const PaneHeader = ({ title }: { title: string }) => {
  const sideTabBar = useSideTabBarLayout();
  return (
    <View style={{ paddingTop: sideTabBar?.contentTopPadding ?? 0 }}>
      <View style={tailwind.style('flex flex-row items-center px-4 pt-1 pb-3')}>
        <View style={tailwind.style('w-24 h-9')} />
        <Text
          numberOfLines={1}
          accessibilityRole="header"
          style={tailwind.style(
            'flex-1 text-[17px] text-center leading-[22px] font-inter-medium-24 text-gray-950',
          )}>
          {title}
        </Text>
        <View style={tailwind.style('w-24 h-9')} />
      </View>
    </View>
  );
};
