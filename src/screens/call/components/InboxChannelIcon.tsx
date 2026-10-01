import React from 'react';

import { Icon } from '@/components-next/common/icon';
import { getChannelIcon } from '@/utils';
import type { Channel } from '@/types';

type InboxChannelIconProps = { channelType: string; medium: string; size: number };

// The icon the app uses for this kind of inbox: WhatsApp, SMS, the website widget and so on
export const InboxChannelIcon = ({ channelType, medium, size }: InboxChannelIconProps) => (
  <Icon icon={getChannelIcon(channelType as Channel, medium, '')} size={size} />
);
