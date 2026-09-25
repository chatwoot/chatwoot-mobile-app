import React from 'react';
import { Text, View } from 'react-native';

import { tailwind } from '@/theme';

import { CALL_TONES, type CallTone } from '../constants/callTheme';
import type { CallerInfo } from '../hooks/useCallerInfo';
import { CallAvatar } from './CallAvatar';
import { GoToConversationButton } from './GoToConversationButton';

type CallerIdentityProps = {
  info: CallerInfo;
  statusText: string;
  tone: CallTone;
  // The timer reads larger than the phase words
  showsTimer: boolean;
  // Discs swell out from the avatar while the call rings or is being placed
  aura: boolean;
  onOpenConversation?: () => void;
};

// The middle of the call screen: the phase or timer, the caller, and the way into the chat
export const CallerIdentity = ({
  info,
  statusText,
  tone,
  showsTimer,
  aura,
  onOpenConversation,
}: CallerIdentityProps) => (
  <View
    style={tailwind.style('absolute inset-0 items-center justify-center pb-[110px] px-8')}
    pointerEvents="box-none">
    <Text
      style={[
        tailwind.style('font-inter-medium-24'),
        showsTimer
          ? tailwind.style('text-[20px] leading-[26px] tracking-[0.5px] mb-[22px] tabular-nums')
          : tailwind.style('text-[15px] leading-5 mb-7'),
        { color: CALL_TONES[tone].status },
      ]}>
      {statusText}
    </Text>
    <CallAvatar name={info.name} uri={info.avatar || undefined} tone={tone} aura={aura} />
    <Text
      numberOfLines={1}
      style={tailwind.style(
        'font-inter-580-24 text-[30px] leading-9 tracking-[-0.2px] text-gray-950 mt-[26px]',
      )}>
      {info.name}
    </Text>
    {info.phone ? (
      <Text
        style={tailwind.style(
          'font-inter-420-20 text-[17px] leading-[22px] text-[#737373] mt-1.5 tabular-nums',
        )}>
        {info.phone}
      </Text>
    ) : null}
    {onOpenConversation ? <GoToConversationButton onPress={onOpenConversation} /> : null}
  </View>
);
