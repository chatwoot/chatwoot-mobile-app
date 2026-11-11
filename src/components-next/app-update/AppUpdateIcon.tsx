import React from 'react';
import { Image, View } from 'react-native';

import { useTailwind } from '@/theme/useTailwind';
import { ArrowUpIcon } from '@/svg-icons';
import AppIcon from '@/assets/images/app-icon.png';

type AppUpdateIconProps = {
  size: 56 | 72;
};

const BADGE = {
  56: { ring: 24, badge: 20, arrow: 11, radius: 14 },
  72: { ring: 30, badge: 26, arrow: 14, radius: 18 },
};

export const AppUpdateIcon = ({ size }: AppUpdateIconProps) => {
  const tailwind = useTailwind();
  const { ring, badge, arrow, radius } = BADGE[size];

  return (
    <View style={{ width: size, height: size }}>
      <Image
        source={AppIcon}
        accessibilityIgnoresInvertColors
        style={[
          { width: size, height: size, borderRadius: radius },
          tailwind.style('border border-blackA-A3'),
        ]}
      />
      <View
        style={[
          tailwind.style('absolute items-center justify-center rounded-full bg-white'),
          { width: ring, height: ring, bottom: -4, end: -4 },
        ]}>
        <View
          style={[
            tailwind.style('items-center justify-center rounded-full bg-gray-950'),
            { width: badge, height: badge },
          ]}>
          <View style={{ width: arrow, height: arrow }}>
            <ArrowUpIcon stroke={tailwind.color('text-gray-50')} />
          </View>
        </View>
      </View>
    </View>
  );
};
