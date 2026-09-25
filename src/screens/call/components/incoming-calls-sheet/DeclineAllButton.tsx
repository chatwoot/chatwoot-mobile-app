import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { tailwind } from '@/theme';
import i18n from '@/i18n';
import { EndGlyph } from '@/svg-icons';

import { CALL_END, solidSurface } from '../../constants/callTheme';
import { GlassSurface } from '../GlassSurface';

// A pill that declines every ringing call at once
export const DeclineAllButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [
      tailwind.style('self-center mt-3.5'),
      pressed ? { opacity: 0.7 } : null,
    ]}>
    <GlassSurface
      style={tailwind.style('h-10 rounded-full px-[18px] flex-row items-center gap-2')}
      fallbackStyle={solidSurface(20, 'pill')}>
      <View style={tailwind.style('h-[18px] w-[18px]')}>
        <EndGlyph color={CALL_END} size={18} />
      </View>
      <Text style={tailwind.style('font-inter-medium-24 text-[15px] leading-5 text-[#D6335B]')}>
        {i18n.t('CONVERSATION.VOICE_WIDGET.DECLINE_ALL')}
      </Text>
    </GlassSurface>
  </Pressable>
);
