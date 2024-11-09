import React from 'react';

import { tailwind } from '@/theme';
import { NativeView } from '../native-components';
import { FacebookIcon } from '@/svg-icons';

type ChannelIndicatorProps = {
  channel: 'facebook' | 'whatsapp' | 'chatwoot';
};

export const ChannelIndicator = (props: ChannelIndicatorProps) => {
  return (
    <NativeView style={tailwind.style('pl-1 h-4 w-4  justify-center items-center')}>
      <FacebookIcon />
    </NativeView>
  );
};
