import React from 'react';
import { Text, View } from 'react-native';

import type { LiveCall } from '@/store/call/callTypes';
import { tailwind } from '@/theme';

import { CALL_MUTED_TEXT, CALL_TONES, type CallTone } from '../constants/callTheme';
import type { CallerInfo } from '../hooks/useCallerInfo';
import { useCallStatusText } from '../hooks/useCallStatusText';
import type { CallStatusFlags } from '../utils/callStatusText';
import { CallAvatar } from './CallAvatar';
import { GoToConversationButton } from './GoToConversationButton';
import { InboxChannelIcon } from './InboxChannelIcon';

type CallerIdentityProps = {
  info: CallerInfo;
  call: LiveCall;
  activeSince?: number;
  statusFlags: CallStatusFlags;
  tone: CallTone;
  // Discs swell out from the avatar while the call rings
  aura: boolean;
  onOpenConversation?: () => void;
};

// The middle of the call screen: the phase or timer, the caller, the inbox they rang, and the
// way into the chat
export const CallerIdentity = ({
  info,
  call,
  activeSince,
  statusFlags,
  tone,
  aura,
  onOpenConversation,
}: CallerIdentityProps) => (
  <View
    style={tailwind.style('absolute inset-0 items-center justify-center pb-[110px] px-8')}
    pointerEvents="box-none">
    <CallStatusLine call={call} activeSince={activeSince} flags={statusFlags} tone={tone} />
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
    {info.inboxName ? (
      <View style={tailwind.style('flex-row items-center gap-2 mt-1.5 max-w-full')}>
        <InboxChannelIcon channelType={info.channelType} medium={info.medium} size={18} />
        <Text
          numberOfLines={1}
          style={[
            tailwind.style('font-inter-420-20 text-[17px] leading-[22px] shrink'),
            { color: CALL_MUTED_TEXT },
          ]}>
          {info.inboxName}
        </Text>
      </View>
    ) : null}
    {onOpenConversation ? <GoToConversationButton onPress={onOpenConversation} /> : null}
  </View>
);

const CallStatusLine = ({
  call,
  activeSince,
  flags,
  tone,
}: {
  call: LiveCall;
  activeSince?: number;
  flags: CallStatusFlags;
  tone: CallTone;
}) => {
  const text = useCallStatusText(call, activeSince, flags);
  return (
    <Text
      style={[
        tailwind.style('font-inter-medium-24 text-[17px] leading-[22px] mb-6 tabular-nums'),
        { color: CALL_TONES[tone].status },
      ]}>
      {text}
    </Text>
  );
};
