import { createContext, useContext } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Width of the area a screen is drawn in. Split view panes (iPhone Duo) are narrower
// than the window, so layouts that size themselves from the screen use this instead.
export const ContainerWidthContext = createContext<number | null>(null);

export const useContainerWidth = () => {
  const paneWidth = useContext(ContainerWidthContext);
  const { width } = useWindowDimensions();
  // Full-screen pages keep clear of side insets (e.g. the status bar column on iPhone Duo),
  // so their content area is the window minus those insets.
  const { left, right } = useSafeAreaInsets();
  return paneWidth ?? width - left - right;
};
