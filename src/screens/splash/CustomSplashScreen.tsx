import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Platform, ImageBackground } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// AI Sparkle icon - matches the sparkle in the splash image
const AISparkle = ({ color, size = 24 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L13.09 8.26L18 6L14.74 10.91L21 12L14.74 13.09L18 18L13.09 15.74L12 22L10.91 15.74L6 18L9.26 13.09L3 12L9.26 10.91L6 6L10.91 8.26L12 2Z"
      fill={color}
    />
  </Svg>
);

interface CustomSplashScreenProps {
  onFinish?: () => void;
}

export const CustomSplashScreen: React.FC<CustomSplashScreenProps> = ({ onFinish }) => {
  // Only show custom animation on iOS
  if (Platform.OS !== 'ios') {
    return null;
  }

  const sparkle1Anim = useRef(new Animated.Value(0.3)).current;
  const sparkle2Anim = useRef(new Animated.Value(0.3)).current;
  const sparkle3Anim = useRef(new Animated.Value(0.3)).current;
  
  const sparkle1Scale = useRef(new Animated.Value(0.8)).current;
  const sparkle2Scale = useRef(new Animated.Value(0.8)).current;
  const sparkle3Scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Heartbeat animation - one by one, left to right, then back
    const createHeartbeat = (
      opacityAnim: Animated.Value, 
      scaleAnim: Animated.Value, 
      delay: number
    ) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1.2,
              friction: 3,
              tension: 100,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(opacityAnim, {
              toValue: 0.3,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 0.8,
              friction: 3,
              tension: 100,
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(600 - delay), // Complete the cycle
        ])
      );
    };

    // Start animations with staggered delays (left to right)
    const anim1 = createHeartbeat(sparkle1Anim, sparkle1Scale, 0);
    const anim2 = createHeartbeat(sparkle2Anim, sparkle2Scale, 200);
    const anim3 = createHeartbeat(sparkle3Anim, sparkle3Scale, 400);

    anim1.start();
    anim2.start();
    anim3.start();

    // Auto-finish after animation plays
    const timer = setTimeout(() => {
      onFinish?.();
    }, 2500);

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
      clearTimeout(timer);
    };
  }, [onFinish]);

  // Colors from the splash image text
  const LIME_GREEN = '#CDFF00'; // Yellow-green from Arabic text
  const WHITE = '#FFFFFF'; // White from logo

  return (
    <ImageBackground
      source={require('../../../assets/splash.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* AI Sparkles loading animation - positioned below Arabic text */}
      <View style={styles.sparklesContainer}>
        <Animated.View
          style={[
            styles.sparkle,
            {
              opacity: sparkle1Anim,
              transform: [{ scale: sparkle1Scale }],
            },
          ]}
        >
          <AISparkle color={LIME_GREEN} size={20} />
        </Animated.View>
        
        <Animated.View
          style={[
            styles.sparkle,
            {
              opacity: sparkle2Anim,
              transform: [{ scale: sparkle2Scale }],
            },
          ]}
        >
          <AISparkle color={WHITE} size={24} />
        </Animated.View>
        
        <Animated.View
          style={[
            styles.sparkle,
            {
              opacity: sparkle3Anim,
              transform: [{ scale: sparkle3Scale }],
            },
          ]}
        >
          <AISparkle color={LIME_GREEN} size={20} />
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
