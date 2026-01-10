import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
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

// Brand colors
const BLUE = '#2E4AFF';
const WHITE = '#FFFFFF';

// Blue AI Sparkle Loader - three dots pulsing sequentially
const AISparkleLoader: React.FC = () => {
  const dot1Opacity = useSharedValue(0.3);
  const dot2Opacity = useSharedValue(0.3);
  const dot3Opacity = useSharedValue(0.3);

  useEffect(() => {
    // Dot 1 animation
    dot1Opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 350, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 350, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Dot 2 animation (delayed)
    dot2Opacity.value = withDelay(
      120,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 350, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 350, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    // Dot 3 animation (more delayed)
    dot3Opacity.value = withDelay(
      240,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 350, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 350, easing: Easing.inOut(Easing.ease) })
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
  return (
    <View style={styles.container}>
      <StatusBar 
        backgroundColor={WHITE} 
        barStyle="dark-content" 
      />
      
      {/* Rounded Logo Container */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../../assets/AlooChat Android App Icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Blue AI Sparkle Loader - below logo */}
      <View style={styles.loaderWrapper}>
        <AISparkleLoader />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    backgroundColor: WHITE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  loaderWrapper: {
    marginTop: 40,
    alignItems: 'center',
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BLUE,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
});
