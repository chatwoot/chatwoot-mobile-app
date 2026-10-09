import React from 'react';
import { Text, View } from 'react-native';

import { tailwind } from '@/theme';

import { CALL_INK } from '../../constants/callTheme';
import type { CallerInfo } from '../../hooks/useCallerInfo';
import { CallerMetaLine } from './CallerMetaLine';
import { RingingAvatar } from './RingingAvatar';

// One ringing caller, large, when nobody else is waiting
export const SingleCallerCard = ({ info }: { info: CallerInfo }) => (
  <View style={tailwind.style('flex-row items-center gap-3.5 mt-3')}>
    <RingingAvatar name={info.name} uri={info.avatar || undefined} size="large" />
    <View style={tailwind.style('flex-1 min-w-0 gap-1')}>
      <Text
        numberOfLines={1}
        style={[
          tailwind.style('font-inter-580-24 text-[22px] leading-[26px] tracking-[-0.2px]'),
          { color: CALL_INK },
        ]}>
        {info.name}
      </Text>
      <CallerMetaLine
        phone={info.phone}
        inboxName={info.inboxName}
        channelType={info.channelType}
        medium={info.medium}
        size="large"
      />
    </View>
  </View>
);
