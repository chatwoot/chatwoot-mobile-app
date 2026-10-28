import { useTailwind } from '@/theme/useTailwind';
import React from 'react';
import { Text, View } from 'react-native';

import { EmptyStateIcon } from '@/svg-icons';

// Shared empty state for the split view (list and conversation pane), so both use the
// same icon, type and spacing.
export const SplitEmptyState = ({
  message,
  icon = <EmptyStateIcon />,
}: {
  message: string;
  // The conversation pane passes its own icon so it differs from the list's.
  icon?: React.ReactElement;
}) => {
  const tailwind = useTailwind();
  return (
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
};
