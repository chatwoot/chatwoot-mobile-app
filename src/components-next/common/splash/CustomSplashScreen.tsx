import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  Platform,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';

// Brand colors matching splash design
const NEON_GREEN = '#DFFF00';
const WHITE = '#FFFFFF';

// ✨ Sparkle Loader Component - positioned below Arabic text
const SparkleLoader: React.FC = () => {
  const dot1Opacity = useSharedValue(0.3);
  const dot2Opacity = useSharedValue(0.3);
  const dot3Opacity = useSharedValue(0.3);
  const dot4Opacity = useSharedValue(0.3);
  const dot5Opacity = useSharedValue(0.3);

  useEffect(() => {
    // Staggered animation for sparkle effect
    const animateDot = (dotOpacity: { value: number }, delay: number) => {
      dotOpacity.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 350, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.3, { duration: 350, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        )
      );
    };

    animateDot(dot1Opacity, 0);
    animateDot(dot2Opacity, 100);
    animateDot(dot3Opacity, 200);
    animateDot(dot4Opacity, 300);
    animateDot(dot5Opacity, 400);
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: dot1Opacity.value,
    transform: [{ scale: 0.7 + dot1Opacity.value * 0.4 }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: dot2Opacity.value,
    transform: [{ scale: 0.7 + dot2Opacity.value * 0.4 }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: dot3Opacity.value,
    transform: [{ scale: 0.7 + dot3Opacity.value * 0.4 }],
  }));

  const dot4Style = useAnimatedStyle(() => ({
    opacity: dot4Opacity.value,
    transform: [{ scale: 0.7 + dot4Opacity.value * 0.4 }],
  }));

  const dot5Style = useAnimatedStyle(() => ({
    opacity: dot5Opacity.value,
    transform: [{ scale: 0.7 + dot5Opacity.value * 0.4 }],
  }));

  return (
    <View style={styles.sparkleContainer}>
      <Animated.View style={[styles.sparkleDot, styles.dotSmall, dot1Style]} />
      <Animated.View style={[styles.sparkleDot, styles.dotMedium, dot2Style]} />
      <Animated.View style={[styles.sparkleDot, styles.dotLarge, dot3Style]} />
      <Animated.View style={[styles.sparkleDot, styles.dotMedium, dot4Style]} />
      <Animated.View style={[styles.sparkleDot, styles.dotSmall, dot5Style]} />
    </View>
  );
};

export const CustomSplashScreen: React.FC = () => {
  // Use Android-specific splash image
  const splashImage = Platform.select({
    android: require('@/assets/images/splash-android.png'),
    ios: require('@/assets/images/splash.png'),
    default: require('@/assets/images/splash-android.png'),
  });

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Full screen splash image - ImageBackground for proper scaling */}
      <ImageBackground
        source={splashImage}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Sparkle loader positioned at bottom center, below Arabic text */}
        <View style={styles.loaderPositioner}>
          <SparkleLoader />
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loaderPositioner: {
    position: 'absolute',
    bottom: '6%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  sparkleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  sparkleDot: {
    backgroundColor: NEON_GREEN,
    shadowColor: NEON_GREEN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  dotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotMedium: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotLarge: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
