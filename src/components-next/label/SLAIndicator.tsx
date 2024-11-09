import React from 'react';
import { Text } from 'react-native';

import { tailwind } from '../../theme';
import { NativeView } from '../native-components';
import { SlaMissedIcon } from '@/svg-icons';

export const SLAIndicator = () => {
  return (
    <NativeView style={tailwind.style('flex flex-row justify-center items-center')}>
      <SlaMissedIcon />
      <Text
        style={tailwind.style(
          'pl-1 text-ruby-800 text-cxs leading-[16px] font-inter-semibold-24 text-center',
        )}>
        NRT: 11d 5h
      </Text>
    </NativeView>
  );
};
