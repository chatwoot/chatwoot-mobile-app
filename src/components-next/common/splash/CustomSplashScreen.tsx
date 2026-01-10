import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Dimensions, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';

// Brand color - matches splash.png neon green
const NEON_GREEN = '#DFFF00';

// Simple AI Sparkle Loader - three dots fading sequentially
const SimpleLoader: React.FC = () => {
  const dot1Opacity = useSharedValue(0.3);
  const dot2Opacity = useSharedValue(0.3);
  const dot3Opacity = useSharedValue(0.3);

  useEffect(() => {
    dot1Opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    dot2Opacity.value = withDelay(
      150,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 400, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    dot3Opacity.value = withDelay(
      300,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 400, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: dot1Opacity.value,
    transform: [{ scale: 0.8 + dot1Opacity.value * 0.3 }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: dot2Opacity.value,
    transform: [{ scale: 0.8 + dot2Opacity.value * 0.3 }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: dot3Opacity.value,
    transform: [{ scale: 0.8 + dot3Opacity.value * 0.3 }],
  }));

  return (
    <View style={styles.loaderContainer}>
      <Animated.View style={[styles.dot, dot1Style]} />
      <Animated.View style={[styles.dot, dot2Style]} />
      <Animated.View style={[styles.dot, dot3Style]} />
    </View>
  );
};

export const CustomSplashScreen: React.FC = () => {
  // Use hook for responsive dimensions
  const { width, height } = useWindowDimensions();

  return (
    <View style={styles.container}>
      {/* splash.png displayed as-is - full screen responsive */}
      <Image
        source={require('@/assets/images/splash.png')}
        style={[styles.splashImage, { width, height }]}
        resizeMode="cover"
      />
      
      {/* Simple loader at bottom center - below Arabic text */}
      <View style={[styles.loaderWrapper, { bottom: height * 0.05 }]}>
        <SimpleLoader />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  splashImage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  loaderWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: NEON_GREEN,
    shadowColor: NEON_GREEN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
});
