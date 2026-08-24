import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_HEIGHT } from '@/constants';

// Android renders edge to edge, so the bar grows by the navigation bar inset to
// keep the tab items clear of the system buttons or gesture pill.
export const useTabBarHeight = () => {
  const { bottom } = useSafeAreaInsets();
  return Platform.OS === 'ios' ? TAB_BAR_HEIGHT : TAB_BAR_HEIGHT - 21 + bottom;
};
