import React from 'react';
import { Text, View } from 'react-native';

import { tailwind } from '@/theme';

import { CALL_LABEL_TEXT } from '../../constants/callTheme';
import { InboxChannelIcon } from '../InboxChannelIcon';

const META_RULE = 'hsl(0, 0%, 78%)';

const SIZES = {
  large: { text: 'text-[15px] leading-5', mark: 14, gap: 'gap-1.5' },
  row: { text: 'text-[13px] leading-4', mark: 12, gap: 'gap-[5px]' },
};

type CallerMetaLineProps = {
  phone?: string | null;
  inboxName: string;
  channelType: string;
  medium: string;
  size: keyof typeof SIZES;
};

// The caller's number and the inbox they rang, split by a short rule; the inbox name gives
// way first when the line runs out of room
export const CallerMetaLine = ({
  phone,
  inboxName,
  channelType,
  medium,
  size,
}: CallerMetaLineProps) => {
  const { text, mark, gap } = SIZES[size];
  const textStyle = [tailwind.style('font-inter-420-20', text), { color: CALL_LABEL_TEXT }];
  return (
    <View style={tailwind.style('flex-row items-center gap-2 min-w-0')}>
      {phone ? (
        <>
          <Text style={[textStyle, tailwind.style('tabular-nums')]}>{phone}</Text>
          <View style={[tailwind.style('h-2 w-px'), { backgroundColor: META_RULE }]} />
        </>
      ) : null}
      <View style={tailwind.style('flex-row items-center shrink min-w-0', gap)}>
        <InboxChannelIcon channelType={channelType} medium={medium} size={mark} />
        <Text numberOfLines={1} style={[textStyle, tailwind.style('shrink')]}>
          {inboxName}
        </Text>
      </View>
    </View>
  );
};
