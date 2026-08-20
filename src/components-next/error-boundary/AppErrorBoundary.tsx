import React from 'react';
import { SafeAreaView } from 'react-native';
import Animated from 'react-native-reanimated';
import { ErrorBoundary } from '@sentry/react-native';

import i18n from '@/i18n';
import { tailwind } from '@/theme';
import { Button } from '../button';

type FallbackProps = {
  resetError: () => void;
};

const Fallback = ({ resetError }: FallbackProps) => (
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
  <ErrorBoundary fallback={({ resetError }) => <Fallback resetError={resetError} />}>
    {children}
  </ErrorBoundary>
);
