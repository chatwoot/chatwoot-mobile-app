import React from 'react';

import { tailwind } from '@/theme';
import { ConversationPriority } from '@/types';
import { NativeView } from '@/components-next/native-components';
import { HighIcon, MediumIcon, LowIcon, UrgentIcon } from '@/svg-icons/priority-icons';
import { Icon } from '@/components-next';

type PriorityIndicatorProps = {
  priority: ConversationPriority;
};

export const getPriorityIcon = (priority: ConversationPriority) => {
  switch (priority) {
    case 'high':
      return <HighIcon />;
    case 'medium':
      return <MediumIcon />;
    case 'low':
      return <LowIcon />;
    case 'urgent':
      return <UrgentIcon />;
    default:
      return null;
  }
};

export const PriorityIndicator = (props: PriorityIndicatorProps) => {
  return (
    <NativeView style={tailwind.style('h-4 w-4 rounded justify-center items-center')}>
      <Icon icon={getPriorityIcon(props.priority)} />
    </NativeView>
  );
};
