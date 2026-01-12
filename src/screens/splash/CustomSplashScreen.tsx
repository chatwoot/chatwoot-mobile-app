import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Platform, ImageBackground } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 4-pointed star sparkle - smooth curved diamond shape like the reference image
const AISparkle = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <Path
      d="M50 0 C52 35 52 35 100 50 C52 52 52 52 50 100 C48 52 48 52 0 50 C48 48 48 48 50 0Z"
      fill={color}
    />
  </Svg>
);

interface CustomSplashScreenProps {
  onFinish?: () => void;
}

export const CustomSplashScreen: React.FC<CustomSplashScreenProps> = ({ onFinish }) => {
  // 4 sparkles with opacity and scale animations
  const sparkle1Opacity = useRef(new Animated.Value(0.2)).current;
  const sparkle2Opacity = useRef(new Animated.Value(0.2)).current;
  const sparkle3Opacity = useRef(new Animated.Value(0.2)).current;
  const sparkle4Opacity = useRef(new Animated.Value(0.2)).current;
  
  const sparkle1Scale = useRef(new Animated.Value(0.5)).current;
  const sparkle2Scale = useRef(new Animated.Value(0.5)).current;
  const sparkle3Scale = useRef(new Animated.Value(0.5)).current;
  const sparkle4Scale = useRef(new Animated.Value(0.5)).current;


  useEffect(() => {
    // Skip animation on non-iOS
    if (Platform.OS !== 'ios') {
      onFinish?.();
      return;
    }

    // Wave animation - sparkles light up in sequence
    const createSparkleAnimation = (
      opacityAnim: Animated.Value, 
      scaleAnim: Animated.Value,
      delay: number
    ) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          // Appear with pop effect
          Animated.parallel([
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1.1,
              friction: 4,
              tension: 120,
              useNativeDriver: true,
            }),
          ]),
          // Fade out with shrink
          Animated.parallel([
            Animated.timing(opacityAnim, {
              toValue: 0.2,
              duration: 350,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 0.5,
              duration: 350,
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(800 - delay), // Complete the cycle
        ])
      );
    };

    // Start animations with staggered delays - wave effect left to right
    const anim1 = createSparkleAnimation(sparkle1Opacity, sparkle1Scale, 0);
    const anim2 = createSparkleAnimation(sparkle2Opacity, sparkle2Scale, 150);
    const anim3 = createSparkleAnimation(sparkle3Opacity, sparkle3Scale, 300);
    const anim4 = createSparkleAnimation(sparkle4Opacity, sparkle4Scale, 450);

    anim1.start();
    anim2.start();
    anim3.start();
    anim4.start();

    // Auto-finish after animation plays
    const timer = setTimeout(() => {
      onFinish?.();
    }, 2800);

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
      anim4.stop();
      clearTimeout(timer);
    };
  }, [onFinish]);

  // Colors from the splash image text
  const LIME_GREEN = '#CDFF00';
  const WHITE = '#FFFFFF';

  // Only render on iOS
  if (Platform.OS !== 'ios') {
    return null;
  }

  return (
    <ImageBackground
      source={require('../../../assets/splash.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* 4 AI Sparkles with wave loading animation */}
      <View style={styles.sparklesContainer}>
        <Animated.View
          style={[
            styles.sparkle,
            {
              opacity: sparkle1Opacity,
              transform: [{ scale: sparkle1Scale }],
            },
          ]}
        >
          <AISparkle color={LIME_GREEN} size={18} />
        </Animated.View>
        
        <Animated.View
          style={[
            styles.sparkle,
            {
              opacity: sparkle2Opacity,
              transform: [{ scale: sparkle2Scale }],
            },
          ]}
        >
          <AISparkle color={WHITE} size={22} />
        </Animated.View>
        
        <Animated.View
          style={[
            styles.sparkle,
            {
              opacity: sparkle3Opacity,
              transform: [{ scale: sparkle3Scale }],
            },
          ]}
        >
          <AISparkle color={LIME_GREEN} size={22} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sparkle,
            {
              opacity: sparkle4Opacity,
              transform: [{ scale: sparkle4Scale }],
            },
          ]}
        >
          <AISparkle color={WHITE} size={18} />
        </Animated.View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sparklesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: SCREEN_HEIGHT * 0.12, // Position below Arabic text
    paddingHorizontal: 20,
  },
  sparkle: {
    padding: 4,
  },
});

export default CustomSplashScreen;
