import React from 'react';

import { tailwind } from '@/theme';
import { NativeView } from '@/components-next/native-components';
import { Icon } from '@/components-next';
import { getChannelTypeIcon } from '@/utils/getChannelTypeIcon';
import { Channel } from '@/types';

type ChannelIndicatorProps = {
  channel: Channel;
};

export const ChannelIndicator = (props: ChannelIndicatorProps) => {
  return (
    <NativeView style={tailwind.style('pl-1 h-4 w-4  justify-center items-center')}>
      <Icon icon={getChannelTypeIcon(props.channel)} />
    </NativeView>
  );
};
