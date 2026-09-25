import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { tailwind } from '@/theme';
import i18n from '@/i18n';
import { ChevronRight } from '@/svg-icons';

import { solidSurface } from '../constants/callTheme';
import { GlassSurface } from './GlassSurface';

// A pill under the caller that opens the conversation behind the call
export const GoToConversationButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    hitSlop={8}
    style={({ pressed }) => [
      tailwind.style('mt-[22px]'),
      pressed ? tailwind.style('opacity-70') : null,
    ]}>
    <GlassSurface
      interactive
      style={tailwind.style('h-10 rounded-full pl-[18px] pr-3.5 flex-row items-center gap-1')}
      fallbackStyle={solidSurface(20, 'pill')}>
      <Text style={tailwind.style('font-inter-medium-24 text-[15px] leading-5 text-blue-800')}>
        {i18n.t('CONVERSATION.VOICE_WIDGET.GO_TO_CONVERSATION')}
      </Text>
      <View style={tailwind.style('h-4 w-4')}>
        <ChevronRight stroke={tailwind.color('text-blue-800') as string} />
      </View>
    </GlassSurface>
  </Pressable>
);
