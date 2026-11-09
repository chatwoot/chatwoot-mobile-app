import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tailwind } from '@/theme';
import { useIsSplitLayout, useSideTabBarLayout } from '@/utils';

export const SideColumnDivider = () => {
  const sideTabBar = useSideTabBarLayout();
  const isSplit = useIsSplitLayout();
  const { left, right } = useSafeAreaInsets();
  if (!sideTabBar || isSplit) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        tailwind.style('absolute top-0 bottom-0 bg-blackA-A3'),
        { width: StyleSheet.hairlineWidth },
        sideTabBar.edge === 'right' ? { right } : { left },
      ]}
    />
  );
};
