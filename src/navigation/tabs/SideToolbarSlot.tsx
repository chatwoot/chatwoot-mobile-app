import { useTailwind } from '@/theme/useTailwind';
import Animated from 'react-native-reanimated';

import { useIsSplitLayout, useSideTabBarLayout } from '@/utils';
import { SIDE_STATUS_BAR_CLEARANCE, SIDE_STATUS_BAR_CLEARANCE_COMPACT } from '@/constants';
import { useSideToolbarItems } from '@/context';

export const SideToolbarSlot = () => {
  const tailwind = useTailwind();
  const sideTabBar = useSideTabBarLayout();
  const sideToolbarItems = useSideToolbarItems();
  const isSplit = useIsSplitLayout();
  if (!sideTabBar || !sideToolbarItems) return null;
  const top = isSplit ? SIDE_STATUS_BAR_CLEARANCE : SIDE_STATUS_BAR_CLEARANCE_COMPACT;
  return (
    <Animated.View
      style={[
        tailwind.style('absolute flex flex-col items-center gap-2.5', `top-[${top}px]`),
        sideTabBar.edge === 'right' ? { right: sideTabBar.offset } : { left: sideTabBar.offset },
      ]}>
      {sideToolbarItems}
    </Animated.View>
  );
};
