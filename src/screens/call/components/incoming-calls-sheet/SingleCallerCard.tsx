import React from 'react';
import { Text, View } from 'react-native';

import { Avatar } from '@/components-next/common/avatar/Avatar';
import { tailwind } from '@/theme';

import type { CallerInfo } from '../../hooks/useCallerInfo';
import { ChatwootMark } from '../ChatwootMark';

// One ringing caller, large, when nobody else is waiting
export const SingleCallerCard = ({ info }: { info: CallerInfo }) => (
  <View style={tailwind.style('flex-row items-center gap-3.5 mt-3')}>
    <Avatar size="4xl" name={info.name} src={info.avatar ? { uri: info.avatar } : undefined} />
    <View style={tailwind.style('flex-1 min-w-0')}>
      <Text
        numberOfLines={1}
        style={tailwind.style(
          'font-inter-580-24 text-[22px] leading-7 tracking-[-0.2px] text-gray-950',
        )}>
        {info.name}
      </Text>
      {info.phone ? (
        <Text
          style={tailwind.style(
            'font-inter-420-20 text-[15px] leading-5 mt-0.5 text-[#737373] tabular-nums',
          )}>
          {info.phone}
        </Text>
      ) : null}
      <View style={tailwind.style('flex-row items-center gap-[5px] mt-1.5')}>
        <ChatwootMark size={14} />
        <Text
          numberOfLines={1}
          style={tailwind.style(
            'font-inter-420-20 text-[13px] leading-4 text-[#5C5C5C] tabular-nums',
          )}>
          {info.inboxName}
        </Text>
      </View>
    </View>
  </View>
);
