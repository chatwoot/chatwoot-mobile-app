import { useTailwind } from '@/theme/useTailwind';
import React from 'react';
import { Text } from 'react-native';

import { NativeView } from '@/components-next/native-components';
import { IOS_LIST_TEXT, useIOSListText } from '@/utils';

type ConversationIdProps = {
  id: number;
};

export const ConversationId = (props: ConversationIdProps) => {
  const tailwind = useTailwind();
  const iosText = useIOSListText();
  const { id } = props;
  return (
    <NativeView style={tailwind.style('flex flex-row items-center gap-0.5')}>
      <Text
        style={tailwind.style(
          'text-sm font-inter-420-20 text-gray-700',
          iosText && IOS_LIST_TEXT.footnote,
        )}>
        #
      </Text>
      <Text
        style={tailwind.style(
          'text-sm font-inter-420-20 text-gray-700',
          iosText && IOS_LIST_TEXT.footnote,
        )}>
        {id}
      </Text>
    </NativeView>
  );
};

ConversationId.displayName = 'ConversationId';
