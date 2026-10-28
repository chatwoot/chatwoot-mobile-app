import { useTailwind } from '@/theme/useTailwind';
import React from 'react';
import { Pressable, SafeAreaView, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { ErrorBoundary } from '@sentry/react-native';

import i18n from '@/i18n';
import { ErrorIcon } from '@/svg-icons';
import { IOS_DESIGN } from '@/utils';
import { Button } from '../button';

type FallbackProps = {
  resetError: () => void;
};

// iOS: the same compact look as the conversation pane's "Could not fetch
// conversation" state (small icon, 17pt title, 15pt gray text, round button).
const SplitFallback = ({ resetError }: FallbackProps) => {
  const tailwind = useTailwind();
  return (
    <View style={tailwind.style('flex-1 bg-gray-50 items-center justify-center px-8')}>
      <View style={tailwind.style('items-center gap-3 max-w-[320px]')}>
        <View style={tailwind.style('h-10 w-10 items-center justify-center')}>
          <View style={{ transform: [{ scale: 0.5 }] }}>
            <ErrorIcon />
          </View>
        </View>
        <Text
          style={tailwind.style(
            'text-[17px] leading-[22px] font-inter-semibold-20 text-gray-950 text-center',
          )}>
          {i18n.t('ERRORS.UNEXPECTED_TITLE')}
        </Text>
        <Text
          style={tailwind.style(
            'text-[15px] leading-[20px] font-inter-normal-20 text-gray-700 text-center',
          )}>
          {i18n.t('ERRORS.UNEXPECTED_DESCRIPTION')}
        </Text>
        <Pressable
          onPress={resetError}
          accessibilityRole="button"
          style={({ pressed }) =>
            tailwind.style(
              'mt-2 h-9 min-w-[88px] px-5 rounded-full items-center justify-center bg-blue-800',
              pressed && 'opacity-80',
            )
          }>
          <Text style={tailwind.style('text-[15px] font-inter-medium-24 text-white')}>
            {i18n.t('ERRORS.TRY_AGAIN')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const PhoneFallback = ({ resetError }: FallbackProps) => {
  const tailwind = useTailwind();
  return (
    <SafeAreaView style={tailwind.style('flex-1 bg-white')}>
      <Animated.View style={tailwind.style('flex-1 items-center justify-center px-6')}>
        <Animated.Text
          style={tailwind.style(
            'text-lg font-inter-medium-24 tracking-[0.16px] text-gray-950 text-center',
          )}>
          {i18n.t('ERRORS.UNEXPECTED_TITLE')}
        </Animated.Text>
        <Animated.Text
          style={tailwind.style(
            'pt-2 text-md font-inter-420-20 tracking-[0.16px] text-gray-700 text-center',
          )}>
          {i18n.t('ERRORS.UNEXPECTED_DESCRIPTION')}
        </Animated.Text>
        <Animated.View style={tailwind.style('pt-6 w-full')}>
          <Button text={i18n.t('ERRORS.TRY_AGAIN')} handlePress={resetError} />
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
};

// iOS uses the compact style everywhere, matching the conversation error state.
const FallbackContent = ({ resetError }: FallbackProps) =>
  IOS_DESIGN ? (
    <SplitFallback resetError={resetError} />
  ) : (
    <PhoneFallback resetError={resetError} />
  );

type AppErrorBoundaryProps = {
  children: React.ReactNode;
};

/**
 * Contains render-phase exceptions that would otherwise reach React Native's
 * ExceptionsManager and terminate the process via RCTFatal.
 *
 * Sentry's ErrorBoundary reports the exception with its React component stack
 * before the fallback renders. `resetError` remounts the subtree, so a fault in
 * one screen does not require the user to relaunch.
 */
export const AppErrorBoundary = ({ children }: AppErrorBoundaryProps) => (
  <ErrorBoundary fallback={({ resetError }) => <FallbackContent resetError={resetError} />}>
    {children}
  </ErrorBoundary>
);
