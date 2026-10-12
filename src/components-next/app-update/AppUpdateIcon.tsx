import React from 'react';
import { Image, View } from 'react-native';

import { tailwind } from '@/theme';
import { ArrowUpIcon } from '@/svg-icons';
import AppIcon from '@/assets/images/app-icon.png';

import { SNACKBAR_SURFACE } from './constants';

type AppUpdateIconProps = {
  size: 56 | 72;
};

const BADGE = {
  56: { ring: 24, badge: 20, arrow: 11, radius: 14 },
  72: { ring: 30, badge: 26, arrow: 14, radius: 18 },
};

/** The Chatwoot app icon with an arrow-up badge on its bottom end corner. */
export const AppUpdateIcon = ({ size }: AppUpdateIconProps) => {
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
            tailwind.style('items-center justify-center rounded-full'),
            { width: badge, height: badge, backgroundColor: SNACKBAR_SURFACE },
          ]}>
          <View style={{ width: arrow, height: arrow }}>
            <ArrowUpIcon />
          </View>
        </View>
      </View>
    </View>
  );
};
