import React from 'react';
import { Text, Animated } from 'react-native';
import { tailwind } from '@/theme';

interface ErrorInformationProps {
  errorCode?: string;
  errorMessage: string;
}

export const ErrorInformation = ({ errorCode, errorMessage }: ErrorInformationProps) => (
  <Animated.View style={tailwind.style('py-6 px-6')}>
    {errorCode && (
      <Text
        style={tailwind.style(
          'text-base  text-gray-950 font-inter-medium-24 leading-[21px] tracking-[0.16px]',
        )}>
        {errorCode}
      </Text>
    )}
    <Text
      style={tailwind.style(
        'text-md text-gray-950 font-inter-420-20 leading-[21px] tracking-[0.16px] mt-2',
      )}>
      {errorMessage}
    </Text>
  </Animated.View>
);
