import { Platform } from 'react-native';

import { TAB_BAR_HEIGHT } from '@/constants';

export const useTabBarHeight = () => {
  return Platform.OS === 'ios' ? TAB_BAR_HEIGHT : TAB_BAR_HEIGHT - 21;
};
