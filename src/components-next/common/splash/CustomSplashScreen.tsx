import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Brand colors
const NEON_GREEN = '#DFFF00';
const WHITE = '#FFFFFF';

// Simple AI Sparkle Loader - Three dots fading in/out sequentially
const SparkleLoader: React.FC = () => {
  const dot1Opacity = useSharedValue(0.3);
  const dot2Opacity = useSharedValue(0.3);
  const dot3Opacity = useSharedValue(0.3);

  useEffect(() => {
    // Dot 1 animation
    dot1Opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Dot 2 animation (delayed)
    dot2Opacity.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 400, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    // Dot 3 animation (more delayed)
    dot3Opacity.value = withDelay(
      400,
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
    transform: [{ scale: 0.8 + dot1Opacity.value * 0.4 }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: dot2Opacity.value,
    transform: [{ scale: 0.8 + dot2Opacity.value * 0.4 }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: dot3Opacity.value,
    transform: [{ scale: 0.8 + dot3Opacity.value * 0.4 }],
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
  return (
    <View style={styles.container}>
      {/* Background splash image */}
      <Image
        source={require('@/assets/images/splash.png')}
        style={styles.image}
        resizeMode="contain"
      />

      {/* Simple sparkle loader positioned below the Arabic text */}
      <View style={styles.loaderWrapper}>
        <SparkleLoader />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: width,
    height: height,
    position: 'absolute',
    // Android fix: use 'cover' to fill the screen properly
    ...Platform.select({
      android: {
        resizeMode: 'cover',
      },
      ios: {
        resizeMode: 'contain',
      },
    }),
  },
  loaderWrapper: {
    position: 'absolute',
    // Position below the Arabic text - adjust for different screen sizes
    bottom: Platform.OS === 'android' ? height * 0.22 : height * 0.25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: NEON_GREEN,
    shadowColor: NEON_GREEN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    // Android elevation for shadow
    elevation: 5,
  },
});
