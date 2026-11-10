import { createContext, useContext } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ContainerWidthContext = createContext<number | null>(null);

export const useContainerWidth = () => {
  const paneWidth = useContext(ContainerWidthContext);
  const { width } = useWindowDimensions();
  const { left, right } = useSafeAreaInsets();
  return paneWidth ?? width - left - right;
};
