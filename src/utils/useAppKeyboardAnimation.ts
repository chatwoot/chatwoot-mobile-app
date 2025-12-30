// import { useKeyboardHandler } from 'react-native-keyboard-controller';
import { useSharedValue, withSpring } from 'react-native-reanimated';

// Force mock for Expo Go - native module not available
let useKeyboardHandler: any = () => {};
// try {
//   useKeyboardHandler = require('react-native-keyboard-controller').useKeyboardHandler;
// } catch (e) {
//   console.warn('react-native-keyboard-controller not available');
//   useKeyboardHandler = () => {};
// }

const ANIMATION_CONFIGS_IOS = {
  damping: 500,
  stiffness: 1000,
  mass: 3,
  overshootClamping: true,
  restDisplacementThreshold: 10,
  restSpeedThreshold: 10,
};

const ANIMATION_CONFIGS = ANIMATION_CONFIGS_IOS;

export const useAppKeyboardAnimation = () => {
  const progress = useSharedValue(0);
  const height = useSharedValue(0);
  useKeyboardHandler({
    onStart: e => {
      'worklet';
      progress.value = withSpring(e.progress, ANIMATION_CONFIGS);
      height.value = withSpring(e.height, ANIMATION_CONFIGS);
    },
  });

  return { height, progress };
};
