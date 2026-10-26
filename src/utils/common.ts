import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SIDE_TAB_BAR_GAP, SIDE_TAB_BAR_WIDTH, TAB_BAR_HEIGHT } from '@/constants';

export type SideTabBarLayout = {
  edge: 'left' | 'right';
  // Distance from the display edge to the capsule.
  offset: number;
  // Extra padding tab screens need on that edge, beyond the safe area, to stay clear of the capsule.
  contentPadding: number;
  // With the status bar on the side the top inset is 0, so tab screen headers add this
  // margin to keep their controls out of the rounded display corner.
  contentTopPadding: number;
};

// On iPhone Duo the system moves the status bar to a side of the display and places
// tab bars on that same side (Apple HIG, "Designing for iPhone Duo"). Follow the
// system: when the status bar sits on a side, put the tab bar there as a floating
// capsule. Returns null when tabs should stay at the bottom.
export const useSideTabBarLayout = (): SideTabBarLayout | null => {
  const { top, left, right } = useSafeAreaInsets();
  const layoutMargin = 20;
  if (Platform.OS !== 'ios') return null;
  const sideInset = Math.max(left, right);
  if (sideInset <= top) return null;
  // Center the capsule in the status bar column, like the status pill. Only when it doesn't
  // fit do screens need extra padding beyond the safe area; otherwise they can run to the
  // display edge (bars and backgrounds full width, content kept clear by the safe area).
  const fits = SIDE_TAB_BAR_WIDTH + 2 <= sideInset;
  const offset = fits
    ? (sideInset - SIDE_TAB_BAR_WIDTH) / 2
    : Math.max(SIDE_TAB_BAR_GAP, (sideInset - SIDE_TAB_BAR_WIDTH) / 2);
  const contentPadding = fits
    ? 0
    : Math.max(0, offset + SIDE_TAB_BAR_WIDTH + SIDE_TAB_BAR_GAP - sideInset);
  return {
    edge: right >= left ? 'right' : 'left',
    offset,
    contentPadding,
    contentTopPadding: Math.max(0, layoutMargin - top),
  };
};

// Narrowest width that gets the list + conversation split view.
const SPLIT_VIEW_MIN_WIDTH = 600;

// Show the list and the open conversation side by side, like Mail or WhatsApp on the
// open iPhone Duo (Apple HIG: split views expand on the inner display and collapse to a
// single pane on the outer one). Applies to the side tab layout when there's room.
export const useIsSplitLayout = () => {
  const { width } = useWindowDimensions();
  const { left, right } = useSafeAreaInsets();
  const sideTabBar = useSideTabBarLayout();
  return sideTabBar !== null && width - left - right >= SPLIT_VIEW_MIN_WIDTH;
};

// Height the bottom tab bar covers at the bottom of tab screens. Android renders
// edge to edge, so the bar grows by the navigation bar inset to keep the tab items
// clear of the system buttons or gesture pill. When tabs are on the side (iPhone Duo),
// only the home indicator area needs to stay clear.
export const useTabBarHeight = () => {
  const { bottom } = useSafeAreaInsets();
  const sideTabBar = useSideTabBarLayout();
  if (sideTabBar) return bottom;
  return Platform.OS === 'ios' ? TAB_BAR_HEIGHT : TAB_BAR_HEIGHT - 21 + bottom;
};
