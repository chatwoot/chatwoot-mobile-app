import React from 'react';
import { Text, View } from 'react-native';

import { tailwind } from '@/theme';
import { useSideTabBarLayout } from '@/utils';

// Header for split view panes and columns (iPhone Duo), matching the list headers: the same
// top margin, a 36pt row with a small centered title, and no divider. Actions live in the
// side toolbar, so the side slots are usually empty; a column with its own navigation (e.g.
// macro details) can put Back and an action in them. They're equal width to keep the title
// centered.
export const PaneHeader = ({
  title,
  left,
  right,
}: {
  title: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
}) => {
  const sideTabBar = useSideTabBarLayout();
  // Equal side slots keep the title centered. They take only the room they need, so long
  // titles fit: none when empty, one round button, or a wider action (e.g. Run).
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
