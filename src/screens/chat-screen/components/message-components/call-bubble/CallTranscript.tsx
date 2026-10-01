import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { tailwind } from '@/theme';
import i18n from '@/i18n';

import { CALL_LINK, bubbleInk, bubbleMuted } from './callBubbleTheme';

const PREVIEW_LINES = 3;

// What was said on the call, three lines at a time
export const CallTranscript = ({ text, lightOnDark }: { text: string; lightOnDark: boolean }) => {
  const [expanded, setExpanded] = useState(false);
  const muted = bubbleMuted(lightOnDark);

  return (
    <View style={tailwind.style('gap-[3px]')}>
      <Text
        style={[
          tailwind.style('font-inter-580-24 uppercase text-[11px] leading-4 tracking-[0.66px]'),
          { color: muted },
        ]}>
        {i18n.t('CONVERSATION.VOICE_CALL.TRANSCRIPT')}
      </Text>
      <Text
        numberOfLines={expanded ? undefined : PREVIEW_LINES}
        style={[
          tailwind.style('font-inter-420-20 text-[13px] leading-[19px]'),
          { color: bubbleInk(lightOnDark) },
        ]}>
        {text}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => setExpanded(value => !value)}
        hitSlop={6}
        style={tailwind.style('self-start py-0.5')}>
        <Text
          style={[
            tailwind.style('font-inter-580-24 text-[12px] leading-4'),
            { color: lightOnDark ? '#FFFFFF' : CALL_LINK },
          ]}>
          {i18n.t(
            expanded
              ? 'CONVERSATION.VOICE_CALL.TRANSCRIPT_SHOW_LESS'
              : 'CONVERSATION.VOICE_CALL.TRANSCRIPT_SHOW_MORE',
          )}
        </Text>
      </Pressable>
    </View>
  );
};
