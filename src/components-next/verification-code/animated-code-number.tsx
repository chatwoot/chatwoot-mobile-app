import { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  FlipInXDown,
  FlipOutXDown,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

export type StatusType = 'inProgress' | 'correct' | 'wrong';

export type AnimatedCodeNumberProps = {
  code?: string;
  highlighted: boolean;
  status: SharedValue<StatusType>;
  isDarkMode: boolean;
};

export const AnimatedCodeNumber: React.FC<AnimatedCodeNumberProps> = ({
  code,
  highlighted,
  status,
  isDarkMode,
}) => {
  const getColorByStatus = useCallback(
    (vStatus: StatusType) => {
      'worklet';
      if (vStatus === 'correct') {
        return '#22bb33';
      }
      if (vStatus === 'wrong') {
        return '#bb2124';
      }
      return isDarkMode ? '#2E2B2E' : '#D3D3D3';
    },
    [isDarkMode],
  );
  const rBoxStyle = useAnimatedStyle(() => {
    return {
      // We rely on the getColorByStatus to retrieve the color based on the status
      // Then we wrap it with the withTiming function to animate the color change
      // in a smooth way
      borderColor: withTiming(getColorByStatus(status.value)),
    };
  }, [getColorByStatus]);

  return (
    <Animated.View style={[styles.container, rBoxStyle]}>
      {code != null && (
        <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(250)}>
          <Animated.Text
            entering={FlipInXDown.duration(500)
              // Go to this website and you'll see the curve I used:
              // https://cubic-bezier.com/#0,0.75,0.5,0.9
              // Basically, I want the animation to start slow, then accelerate at the end
              // Do we really need to use a curve? Every detail matters :)
              .easing(Easing.bezier(0, 0.75, 0.5, 0.9).factory())
              .build()}
            exiting={FlipOutXDown.duration(500)
              // https://cubic-bezier.com/#0.6,0.1,0.4,0.8
              // I want the animation to start fast, then decelerate at the end (opposite of the previous one)
              .easing(Easing.bezier(0.6, 0.1, 0.4, 0.8).factory())
              .build()}
            style={[styles.text, { color: isDarkMode ? 'hsl(0, 0%, 97%)' : 'hsl(0, 0%, 3%)' }]}>
            {code}
          </Animated.Text>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '90%',
    width: '80%',
    borderWidth: 2,
    borderRadius: 12,
    borderCurve: 'continuous',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 40,
    fontFamily: 'Inter-500-24', // Using available Inter font instead of FiraCode
  },
});
