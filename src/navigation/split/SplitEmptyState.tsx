import React from 'react';
import { Text, View } from 'react-native';

import { EmptyStateIcon } from '@/svg-icons';
import { tailwind } from '@/theme';

export const SplitEmptyState = ({
  message,
  icon = <EmptyStateIcon />,
}: {
  message: string;
  icon?: React.ReactElement;
}) => (
  <View style={tailwind.style('items-center gap-4 px-8')}>
    {icon}
    <Text
      style={tailwind.style(
        'max-w-[400px] text-[15px] leading-[20px] font-inter-normal-20 text-gray-700 text-center',
      )}>
      {message}
    </Text>
  </View>
);
