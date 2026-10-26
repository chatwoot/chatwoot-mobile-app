import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useIsInDetailPane, useSplitView } from './SplitViewContext';

/**
 * In the split view's conversation pane the chat runs to the display edge so bars and
 * their lines are full width; content inside them pads by this much to stay clear of the
 * status bar and side toolbar column. 0 elsewhere (the screen's safe area handles it).
 */
export const usePaneRightInset = () => {
  const isInPane = useIsInDetailPane();
  const isSecondaryOpen = useSplitView()?.isSecondaryOpen ?? false;
  const { right } = useSafeAreaInsets();
  // With a secondary column open the conversation sits on the left, away from the edge (the
  // column pads itself).
  return isInPane && !isSecondaryOpen ? right : 0;
};
