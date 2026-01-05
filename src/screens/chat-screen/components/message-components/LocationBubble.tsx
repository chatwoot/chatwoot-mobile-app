import React from 'react';
import { Text } from 'react-native';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { Icon } from '@/components-next/common';

import { MESSAGE_VARIANTS } from '@/constants';
import { MapIcon } from '@/svg-icons';
import { openURL } from '@/utils/urlUtils';

type LocationBubbleProps = {
  latitude: number | 0;
  longitude: number | 0;
  variant: string;
};

export const LocationBubble: React.FC<LocationBubbleProps> = props => {
  const { latitude, longitude, variant } = props;

  const mapUrl = `https://maps.google.com/?q=${latitude},${longitude}`;

  return (
    <Animated.View style={tailwind.style('flex flex-row justify-center items-center gap-1')}>
      <Icon icon={<MapIcon fill="white" />} size={24} />
      <Text
        onPress={() => openURL({ URL: mapUrl })}
        style={tailwind.style(
          variant === MESSAGE_VARIANTS.USER
            ? 'text-base tracking-[0.32px] leading-[22px] font-inter-normal-20 underline'
            : '',
          variant === MESSAGE_VARIANTS.USER ? 'text-white' : '',
          variant === MESSAGE_VARIANTS.AGENT ? 'text-gray-950' : '',
        )}
      >
        See on map
      </Text>
    </Animated.View>
  );
};
