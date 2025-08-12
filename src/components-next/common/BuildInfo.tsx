import React from 'react';
import * as Application from 'expo-application';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/theme';

export const BuildInfo: React.FC = () => {
  const appVersion = Application.nativeApplicationVersion;
  const buildNumber = Application.nativeBuildVersion;
  const text = buildNumber
    ? `Version: ${appVersion}  •  Build Number: ${buildNumber}`
    : `Version: ${appVersion}`;

  return (
    <Animated.Text style={tailwind.style('text-sm text-gray-700')}>{text}</Animated.Text>
  );
};


