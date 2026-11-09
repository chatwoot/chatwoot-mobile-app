import { PropsWithChildren } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView, BlurViewProps } from '@react-native-community/blur';

import { tailwind } from '@/theme';
import { useAppSelector } from '@/hooks';
import { selectCurrentState } from '@/store/conversation/conversationHeaderSlice';
import { ACTION_TAB_HEIGHT } from './actionTabsLayout';

const tabExitSpringConfig = { damping: 20, stiffness: 360, mass: 1 };
const tabEnterSpringConfig = { damping: 30, stiffness: 360, mass: 1 };

type ActionTabBarBackgroundProps = Partial<BlurViewProps> &
  PropsWithChildren & {
    glass?: boolean;
  };

const useLiquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();

export const ActionTabBarBackground = (props: ActionTabBarBackgroundProps) => {
  const { children, blurAmount, blurType, style, glass } = props;

  const currentState = useAppSelector(selectCurrentState);
  const { bottom } = useSafeAreaInsets();
  const hiddenOffset = bottom + 8 + ACTION_TAB_HEIGHT + 24;

  const derivedAnimatedState = useDerivedValue(() =>
    currentState === 'Select'
      ? withSpring(0, tabEnterSpringConfig)
      : withSpring(1, tabExitSpringConfig),
  );

  const animatedTabBarStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(derivedAnimatedState.value, [0, 1], [0, hiddenOffset]),
        },
      ],
    };
  });

  // Layout and shadow sit on the Animated.View. BlurView fills it as a
  // background, clipped to the corner radius by its own wrapper.
  if (glass) {
    return (
      <Animated.View
        style={[style, animatedTabBarStyle, useLiquidGlass ? null : styles.listShadow]}>
        {useLiquidGlass ? (
          <GlassView
            glassEffectStyle="regular"
            style={[StyleSheet.absoluteFill, { borderRadius: ACTION_TAB_HEIGHT / 2 }]}
          />
        ) : (
          <Animated.View style={tailwind.style('absolute inset-0 rounded-full overflow-hidden')}>
            <BlurView
              blurAmount={25}
              blurType="light"
              style={tailwind.style('flex-1 bg-[#00000009]')}
            />
          </Animated.View>
        )}
        {children}
      </Animated.View>
    );
  }

  return Platform.OS === 'ios' ? (
    <Animated.View style={[style, animatedTabBarStyle, styles.listShadow]}>
      <Animated.View style={tailwind.style('absolute inset-0 rounded-[30px] overflow-hidden')}>
        <BlurView {...{ blurAmount, blurType }} style={tailwind.style('flex-1 bg-[#00000009]')} />
      </Animated.View>
      {children}
    </Animated.View>
  ) : (
    <Animated.View style={[style, animatedTabBarStyle, styles.listShadow]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  listShadow:
    Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 10,
        shadowOpacity: 0.25,
      },
      android: {
        elevation: 4,
        backgroundColor: 'white',
      },
    }) || {}, // Add fallback empty object
});
