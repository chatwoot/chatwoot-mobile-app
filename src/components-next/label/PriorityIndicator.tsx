import React from 'react';
import { Text } from 'react-native';

import { tailwind } from '../../theme';
import { ConversationPriority } from '../../types';
import { NativeView } from '../native-components';

type ConversationPriorityKeys = {
  code: number;
  color: string;
};

export const CONVERSATION_PRIORITY_ORDER: Record<ConversationPriority, ConversationPriorityKeys> = {
  urgent: { code: 1, color: 'bg-tomato-700' },
  high: { code: 2, color: 'bg-amber-700' },
  medium: { code: 3, color: 'bg-cyan-700' },
  low: { code: 4, color: 'bg-gold-700' },
};

type PriorityIndicatorProps = {
  priority: ConversationPriority;
};

export const PriorityIndicator = (props: PriorityIndicatorProps) => {
  return (
    <NativeView
      style={tailwind.style(
        'h-4 w-4 rounded bg-tomato-700 justify-center items-center',
        `${CONVERSATION_PRIORITY_ORDER[props.priority].color}`,
      )}>
      {/* Design Review the Text Style */}
      <Text
        style={tailwind.style(
          'text-white text-cxs w-2 leading-[16px] font-inter-semibold-24 text-center',
        )}>
        {CONVERSATION_PRIORITY_ORDER[props.priority].code}
      </Text>
    </NativeView>
  );
};
