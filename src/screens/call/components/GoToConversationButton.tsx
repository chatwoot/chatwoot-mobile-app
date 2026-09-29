import React from 'react';
import { Pressable, Text } from 'react-native';

import { tailwind } from '@/theme';
import i18n from '@/i18n';
import { CaretRightBoldGlyph } from '@/svg-icons';

import { CALL_LINK, PILL_SHADOW } from '../constants/callTheme';

// A pill under the caller that opens the conversation behind the call
export const GoToConversationButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    hitSlop={8}
    style={({ pressed }) => [
      tailwind.style('mt-7 h-10 rounded-full bg-white pl-[18px] pr-3 flex-row items-center gap-2'),
      PILL_SHADOW,
      pressed ? tailwind.style('opacity-70') : null,
    ]}>
    <Text
      style={[tailwind.style('font-inter-medium-24 text-[15px] leading-5'), { color: CALL_LINK }]}>
      {i18n.t('CONVERSATION.VOICE_WIDGET.GO_TO_CONVERSATION')}
    </Text>
    <CaretRightBoldGlyph color={CALL_LINK} size={16} />
  </Pressable>
);
