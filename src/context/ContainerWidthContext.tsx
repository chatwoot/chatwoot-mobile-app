import { createContext, useContext } from 'react';
import { useWindowDimensions } from 'react-native';

// Width of the area a screen is drawn in. Split view panes (iPhone Duo) are narrower
// than the window, so layouts that size themselves from the screen use this instead.
export const ContainerWidthContext = createContext<number | null>(null);

export const useContainerWidth = () => {
  const paneWidth = useContext(ContainerWidthContext);
  const { width } = useWindowDimensions();
  return paneWidth ?? width;
};
