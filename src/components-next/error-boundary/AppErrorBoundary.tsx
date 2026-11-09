import React from 'react';
import { ErrorBoundary } from '@sentry/react-native';

import { FallbackContent } from './FallbackContent';

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
