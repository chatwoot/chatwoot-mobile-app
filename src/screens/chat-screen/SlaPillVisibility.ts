import { createContext, useContext } from 'react';
import type { SharedValue } from 'react-native-reanimated';

export const SlaPillVisibilityContext = createContext<SharedValue<number> | null>(null);

export const useSlaPillVisibility = () => useContext(SlaPillVisibilityContext);
