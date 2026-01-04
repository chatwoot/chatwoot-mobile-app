import React from 'react';
import { Text } from 'react-native';

import { tailwind } from '@/theme';
import { useTheme } from '@/context/ThemeContext';
import { NativeView } from '@/components-next/native-components';

type ConversationIdProps = {
  id: number;
};

export const ConversationId = (props: ConversationIdProps) => {
  const { id } = props;
  const { colors } = useTheme();
  return (
    <NativeView style={tailwind.style('flex flex-row items-center gap-0.5')}>
      <Text style={[tailwind.style('text-sm font-inter-420-20'), { color: colors.textSecondary }]}>#</Text>
      <Text style={[tailwind.style('text-sm font-inter-420-20'), { color: colors.textSecondary }]}>{id}</Text>
    </NativeView>
  );
};

ConversationId.displayName = 'ConversationId';
