import Animated from 'react-native-reanimated';

export const NativeView =
  require('react-native/Libraries/Components/View/ViewNativeComponent').default;

export const AnimatedNativeView = Animated.createAnimatedComponent(NativeView);
