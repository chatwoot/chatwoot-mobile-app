import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { SafeAreaView, StatusBar, Animated, Easing } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import i18n from 'i18n';
import { tailwind } from '@/theme';

export const NoNetworkBar = () => {
  const animationConstants = useMemo(
    () => ({
      DURATION: 800,
      TO_VALUE: 4,
      INPUT_RANGE: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4],
      OUTPUT_RANGE: [0, -15, 0, 15, 0, -15, 0, 15, 0],
    }),
    [],
  );

  const [connected, setConnected] = useState(true);
  const animation = useRef(new Animated.Value(0)).current;

  // Took Reference from https://egghead.io/lessons/react-create-a-button-shake-animation-in-react-native#/tab-code
  const triggerAnimation = useCallback(() => {
    animation.setValue(0);
    Animated.timing(animation, {
      duration: animationConstants.DURATION,
      toValue: animationConstants.TO_VALUE,
      useNativeDriver: true,
      easing: Easing.bounce,
    }).start();
  }, [animation, animationConstants]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const { isConnected } = state;
      setConnected(isConnected ?? false);
      if (isConnected) {
        triggerAnimation();
      }
    });
    return () => {
      unsubscribe();
    };
  }, [triggerAnimation]);

  const interpolated = animation.interpolate({
    inputRange: animationConstants.INPUT_RANGE,
    outputRange: animationConstants.OUTPUT_RANGE,
  });
  const animationStyle = {
    transform: [{ translateX: interpolated }],
  };

  return !connected ? (
    <SafeAreaView style={tailwind.style('bg-red-900')}>
      <StatusBar backgroundColor={tailwind.color('red-900')} />
      <Animated.View style={[tailwind.style(' px-4 py-2'), animationStyle]}>
        <Animated.Text style={[tailwind.style('text-white text-center text-sm'), animationStyle]}>
          {i18n.t('ERRORS.OfFLINE')}
        </Animated.Text>
      </Animated.View>
    </SafeAreaView>
  ) : null;
};
