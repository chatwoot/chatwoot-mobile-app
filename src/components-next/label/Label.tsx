import React from 'react';
import { Text } from 'react-native';

import { tailwind } from '../../theme';
import { LabelType } from '../../types';
import { NativeView } from '../native-components';

// Text Label with the color and text
type LabelProps = LabelType;

export const LabelText = (props: LabelProps) => {
  const { labelColor = '#E54D2E', labelText = 'Bug' } = props;
  return (
    <NativeView style={tailwind.style('flex flex-row items-center py-[3px]')}>
      <NativeView style={tailwind.style('h-[5px] w-[5px] rounded-full', `bg-[${labelColor}]`)} />
      <NativeView style={tailwind.style('pl-1')}>
        <Text
          style={tailwind.style(
            'text-sm font-inter-420-20 leading-[16px] tracking-[0.32px] text-gray-700',
          )}>
          {labelText}
        </Text>
      </NativeView>
    </NativeView>
  );
};
