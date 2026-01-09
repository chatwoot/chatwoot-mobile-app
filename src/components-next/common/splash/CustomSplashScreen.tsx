import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Dimensions, Text } from 'react-native';
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

const { width, height } = Dimensions.get('window');

// Brand colors
const NEON_GREEN = '#DFFF00';
const WHITE = '#FFFFFF';

// AI Node component - glowing dots that pulse
const AINode = ({ delay, x, y, size = 8 }: { delay: number; x: number; y: number; size?: number }) => {
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.8, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: NEON_GREEN,
          shadowColor: NEON_GREEN,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
        },
        animatedStyle,
      ]}
    />
  );
};

// Connecting line between nodes
const ConnectionLine = ({ x1, y1, x2, y2, delay }: { x1: number; y1: number; x2: number; y2: number; delay: number }) => {
  const opacity = useSharedValue(0.1);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x1,
          top: y1,
          width: length,
          height: 1,
          backgroundColor: NEON_GREEN,
          transform: [{ rotate: `${angle}deg` }],
          transformOrigin: 'left center',
        },
        animatedStyle,
      ]}
    />
  );
};

// Progress bar component
const ProgressBar = () => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.ease) });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, animatedStyle]} />
      </View>
      <Text style={styles.loadingText}>Initializing AI...</Text>
    </View>
  );
};

// Orbiting particle
const OrbitingParticle = ({ radius, duration, delay, size = 4 }: { radius: number; duration: number; delay: number; size?: number }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withDelay(
      delay,
      withRepeat(withTiming(360, { duration, easing: Easing.linear }), -1, false)
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const angle = (rotation.value * Math.PI) / 180;
    return {
      transform: [
        { translateX: Math.cos(angle) * radius },
        { translateY: Math.sin(angle) * radius },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: NEON_GREEN,
          shadowColor: NEON_GREEN,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 6,
        },
        animatedStyle,
      ]}
    />
  );
};

export const CustomSplashScreen: React.FC = () => {
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Neural network node positions (relative to center)
  const centerX = width / 2;
  const centerY = height / 2 - 50;

  return (
    <View style={styles.container}>
      {/* Background splash image */}
      <Image
        source={require('@/assets/images/splash.png')}
        style={styles.image}
        resizeMode="contain"
      />

      {/* AI Neural Network Overlay */}
      <View style={styles.overlay}>
        {/* Connection lines */}
        <ConnectionLine x1={centerX - 80} y1={centerY - 60} x2={centerX} y2={centerY} delay={0} />
        <ConnectionLine x1={centerX + 80} y1={centerY - 60} x2={centerX} y2={centerY} delay={200} />
        <ConnectionLine x1={centerX - 100} y1={centerY + 40} x2={centerX} y2={centerY} delay={400} />
        <ConnectionLine x1={centerX + 100} y1={centerY + 40} x2={centerX} y2={centerY} delay={600} />
        <ConnectionLine x1={centerX} y1={centerY + 80} x2={centerX} y2={centerY} delay={800} />

        {/* AI Nodes */}
        <AINode x={centerX - 84} y={centerY - 64} delay={0} size={10} />
        <AINode x={centerX + 76} y={centerY - 64} delay={200} size={10} />
        <AINode x={centerX - 104} y={centerY + 36} delay={400} size={8} />
        <AINode x={centerX + 96} y={centerY + 36} delay={600} size={8} />
        <AINode x={centerX - 4} y={centerY + 76} delay={800} size={8} />

        {/* Central glowing node */}
        <View style={[styles.centralNode, { left: centerX - 15, top: centerY - 15 }]}>
          <OrbitingParticle radius={25} duration={3000} delay={0} size={5} />
          <OrbitingParticle radius={25} duration={3000} delay={1000} size={5} />
          <OrbitingParticle radius={25} duration={3000} delay={2000} size={5} />
          <View style={styles.centralNodeInner} />
        </View>

        {/* Progress bar at bottom */}
        <ProgressBar />
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
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centralNode: {
    position: 'absolute',
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centralNodeInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: NEON_GREEN,
    shadowColor: NEON_GREEN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 100,
    width: width * 0.6,
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(223, 255, 0, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: NEON_GREEN,
    borderRadius: 2,
    shadowColor: NEON_GREEN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  loadingText: {
    marginTop: 12,
    color: WHITE,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1,
    opacity: 0.8,
  },
});
