import React from 'react';
import { Text } from 'react-native';

import { tailwind } from '@/theme';
import { NativeView } from '@/components-next/native-components';
import { SlaMissedIcon } from '@/svg-icons';

export const SLAIndicator = () => {
  return (
    <NativeView style={tailwind.style('flex flex-row justify-center items-center')}>
      <SlaMissedIcon />
      <Text style={tailwind.style('pl-1 text-ruby-800 text-sm leading-[20px] text-center')}>
        NRT: 11d 5h
      </Text>
    </NativeView>
  );
};
