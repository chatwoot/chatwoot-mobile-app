import React from 'react';

import { tailwind } from '@/theme';
import { ConversationPriority } from '@/types';
import { NativeView } from '@/components-next/native-components';
import { UrgentIcon } from '@/svg-icons/priority-icons';

type PriorityIndicatorProps = {
  priority: ConversationPriority;
};

export const PriorityIndicator = (props: PriorityIndicatorProps) => {
  return (
    <NativeView style={tailwind.style('h-4 w-4 rounded justify-center items-center')}>
      <UrgentIcon />
    </NativeView>
  );
};
