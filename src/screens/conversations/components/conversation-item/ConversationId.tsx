import React from 'react';
import { Text } from 'react-native';

import { tailwind } from '@/theme';
import { NativeView } from '@/components-next/native-components';

type ConversationIdProps = {
  id: number;
};

export const ConversationId = (props: ConversationIdProps) => {
  const { id } = props;
  return (
    <NativeView style={tailwind.style('flex flex-row items-center gap-0.5')}>
      <Text style={tailwind.style('text-sm font-inter-420-20 text-gray-700')}>#</Text>
      <Text style={tailwind.style('text-sm font-inter-420-20 text-gray-700')}>{id}</Text>
    </NativeView>
  );
};

ConversationId.displayName = 'ConversationId';
