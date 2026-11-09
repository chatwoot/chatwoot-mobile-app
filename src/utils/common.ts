import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  SIDE_STATUS_COLUMN_SHIFT,
  SIDE_TAB_BAR_GAP,
  SIDE_TAB_BAR_WIDTH,
  TAB_BAR_HEIGHT,
} from '@/constants';

export type SideTabBarLayout = {
  edge: 'left' | 'right';
  offset: number;
  contentPadding: number;
  contentTopPadding: number;
  width: number;
  buttonSize: number;
  iconScale: number;
};

const SPLIT_VIEW_MIN_WIDTH = 600;
const SIDE_TAB_BAR_WIDTH_COMPACT = 48;

export const useSideTabBarLayout = (): SideTabBarLayout | null => {
  const { top, left, right } = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const layoutMargin = 20;
  if (Platform.OS !== 'ios') return null;
  const sideInset = Math.max(left, right);
  if (sideInset <= top) return null;
  const isCompact = windowWidth - left - right < SPLIT_VIEW_MIN_WIDTH;
  const width = isCompact ? SIDE_TAB_BAR_WIDTH_COMPACT : SIDE_TAB_BAR_WIDTH;
  const fits = width + 2 * SIDE_STATUS_COLUMN_SHIFT + 2 <= sideInset;
  const offset = fits
    ? (sideInset - width) / 2 + SIDE_STATUS_COLUMN_SHIFT
    : Math.max(SIDE_TAB_BAR_GAP, (sideInset - width) / 2);
  const contentPadding = fits ? 0 : Math.max(0, offset + width + SIDE_TAB_BAR_GAP - sideInset);
  return {
    edge: right >= left ? 'right' : 'left',
    offset,
    contentPadding,
    contentTopPadding: Math.max(0, layoutMargin - top),
    width,
    buttonSize: width - 6,
    iconScale: isCompact ? 1.17 : 1,
  };
};

export const IOS_DESIGN = Platform.OS === 'ios';

export const isPhoneNumberName = (name?: string | null) => /^[\d\s+().-]*$/.test(name ?? '');

export const useIsSplitLayout = () => {
  const { width } = useWindowDimensions();
  const { left, right } = useSafeAreaInsets();
  const sideTabBar = useSideTabBarLayout();
  return sideTabBar !== null && width - left - right >= SPLIT_VIEW_MIN_WIDTH;
};

export const useTabBarHeight = () => {
  const { bottom } = useSafeAreaInsets();
  const sideTabBar = useSideTabBarLayout();
  if (sideTabBar) return bottom;
  return Platform.OS === 'ios' ? TAB_BAR_HEIGHT : TAB_BAR_HEIGHT - 21 + bottom;
};
