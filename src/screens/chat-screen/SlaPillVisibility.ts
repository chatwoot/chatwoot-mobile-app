import { createContext, useContext } from 'react';
import type { SharedValue } from 'react-native-reanimated';

// 1 when the floating SLA pill under the chat header is shown, 0 when hidden. The message list
// hides it while you scroll down (toward newer messages) and shows it when you scroll up.
export const SlaPillVisibilityContext = createContext<SharedValue<number> | null>(null);

export const useSlaPillVisibility = () => useContext(SlaPillVisibilityContext);
