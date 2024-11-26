/* eslint-disable @typescript-eslint/no-var-requires */
import Animated from 'react-native-reanimated';

export const NativeView =
  require('react-native/Libraries/Components/View/ViewNativeComponent').default;

export const AnimatedNativeView = Animated.createAnimatedComponent(
  NativeView,
) as unknown as typeof NativeView;
