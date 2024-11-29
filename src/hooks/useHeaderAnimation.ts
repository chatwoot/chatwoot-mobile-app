import { withDelay, withSpring } from 'react-native-reanimated';

export const useHeaderAnimation = () => {
  const entering = () => {
    'worklet';
    return {
      initialValues: {
        opacity: 0,
        transform: [{ scale: 0.95 }],
      },
      animations: {
        opacity: withDelay(200, withSpring(1)),
        transform: [{ scale: withDelay(200, withSpring(1)) }],
      },
    };
  };

  const exiting = () => {
    'worklet';
    return {
      initialValues: {
        opacity: 1,
        transform: [{ scale: 1 }],
      },
      animations: {
        opacity: withSpring(0),
        transform: [{ scale: withSpring(0.95) }],
      },
    };
  };

  return { entering, exiting };
};
