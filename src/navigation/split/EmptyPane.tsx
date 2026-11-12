import { useTailwind } from '@/theme/useTailwind';
import React from 'react';

import { View } from 'react-native';

import i18n from '@/i18n';
import { SplitEmptyState } from './SplitEmptyState';
import { ConversationPaneEmptyIcon } from '@/svg-icons';

export const EmptyPane = ({ icon, message }: { icon?: React.ReactElement; message?: string }) => {
  const tailwind = useTailwind();
  return (
    <View style={tailwind.style('flex-1 items-center justify-center')}>
      <SplitEmptyState
        icon={icon ?? <ConversationPaneEmptyIcon />}
        message={message ?? i18n.t('CONVERSATION.SPLIT_VIEW.EMPTY')}
      />
    </View>
  );
};
