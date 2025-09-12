/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { View, ViewStyle } from 'react-native';

import { tailwind } from '@/theme';
import { RenderPropType } from '@/types';

export interface IconComponentProps {
  /**
   * Svg Icon
   */
  icon: RenderPropType;
  /**
   * Bounding Box style for Icon
   */
  style?: ViewStyle;
  /**
   * Icon Size
   */
  size?: 10 | 12 | 16 | 20 | 24 | 32 | number | string;
}

// Please take icons from https://icones.js.org/collection/fluent
export const Icon: React.FC<Partial<IconComponentProps>> = props => {
  const { icon, style, size } = props;
  const iconAspectRatio = 1;
  const sizer = typeof size === 'number' ? `w-[${size}px]` : typeof size === 'string' ? size : '';
  return (
    <View style={[tailwind.style(sizer), style, { aspectRatio: iconAspectRatio }]}>
      {/* @ts-ignore */}
      {icon}
    </View>
  );
};
