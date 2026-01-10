import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Dimensions, Platform, ImageBackground } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';

// Brand colors
const NEON_GREEN = '#DFFF00';

// Futuristic AI Sparkle Loader - rotating dots with glow effect
const AISparkleLoader: React.FC = () => {
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(0.6);
  const dot1Opacity = useSharedValue(0.4);
  const dot2Opacity = useSharedValue(0.4);
  const dot3Opacity = useSharedValue(0.4);

  useEffect(() => {
    // Continuous rotation for futuristic effect
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );

    // Pulse animation for center glow
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.6, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Sequential dot animations
    dot1Opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 300, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    dot2Opacity.value = withDelay(
      150,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.4, { duration: 300, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    dot3Opacity.value = withDelay(
      300,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.4, { duration: 300, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  const rotatingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [{ scale: interpolate(pulse.value, [0.6, 1], [0.8, 1.2]) }],
  }));

  const dot1Style = useAnimatedStyle(() => ({
    opacity: dot1Opacity.value,
    transform: [{ scale: 0.7 + dot1Opacity.value * 0.5 }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: dot2Opacity.value,
    transform: [{ scale: 0.7 + dot2Opacity.value * 0.5 }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: dot3Opacity.value,
    transform: [{ scale: 0.7 + dot3Opacity.value * 0.5 }],
  }));

  return (
    <View style={styles.loaderContainer}>
      {/* Center glow effect */}
      <Animated.View style={[styles.centerGlow, pulseStyle]} />
      
      {/* Rotating outer ring */}
      <Animated.View style={[styles.rotatingRing, rotatingStyle]}>
        <View style={styles.ringDot} />
        <View style={[styles.ringDot, styles.ringDot2]} />
        <View style={[styles.ringDot, styles.ringDot3]} />
      </Animated.View>

      {/* Main dots */}
      <View style={styles.dotsRow}>
        <Animated.View style={[styles.dot, dot1Style]} />
        <Animated.View style={[styles.dot, dot2Style]} />
        <Animated.View style={[styles.dot, dot3Style]} />
      </View>
    </View>
  );
};

export const CustomSplashScreen: React.FC = () => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  return (
    <View style={styles.container}>
      {/* Background splash image - responsive full screen */}
      <ImageBackground
        source={require('@/assets/images/splash.png')}
        style={[styles.imageBackground, { width: dimensions.width, height: dimensions.height }]}
        resizeMode="cover"
      >
        {/* AI Sparkle loader positioned below Arabic text */}
        <View style={[styles.loaderWrapper, { bottom: dimensions.height * 0.08 }]}>
          <AISparkleLoader />
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  loaderWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerGlow: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: NEON_GREEN,
    shadowColor: NEON_GREEN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 10,
  },
  rotatingRing: {
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringDot: {
    position: 'absolute',
    top: 0,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: NEON_GREEN,
    opacity: 0.6,
  },
  ringDot2: {
    top: 'auto',
    bottom: 0,
    left: 5,
  },
  ringDot3: {
    top: 'auto',
    bottom: 0,
    right: 5,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 35,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: NEON_GREEN,
    shadowColor: NEON_GREEN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 8,
  },
});
