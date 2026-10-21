import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { LiveCall } from '@/store/call/callTypes';
import { tailwind } from '@/theme';
import i18n from '@/i18n';

import { CALL_LINK } from '../constants/callTheme';
import { useCallStatusText } from '../hooks/useCallStatusText';
import type { CallStatusFlags } from '../utils/callStatusText';

// Height of the bar's own row, on top of the status bar it covers
export const CALL_BANNER_ROW_HEIGHT = 46;

type CallBannerProps = {
  call: LiveCall;
  activeSince?: number;
  flags: CallStatusFlags;
  onPress: () => void;
};

// Ongoing-call strip across the top of the app, covering the status bar the way the
// system's own call indicator does. Screens keep their safe-area padding, which lands
// directly below the bar, so nothing is hidden underneath it.
export const CallBanner = ({ call, activeSince, flags, onPress }: CallBannerProps) => {
  const insets = useSafeAreaInsets();
  const statusText = useCallStatusText(call, activeSince, flags);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={i18n.t('CONVERSATION.VOICE_WIDGET.RETURN_TO_CALL')}
      onPress={onPress}
      style={tailwind.style('absolute top-0 left-0 right-0')}>
      <View
        style={[tailwind.style('px-5'), { paddingTop: insets.top, backgroundColor: CALL_LINK }]}>
        <View
          style={[
            tailwind.style('flex-row items-center justify-between'),
            { height: CALL_BANNER_ROW_HEIGHT },
          ]}>
          <Text style={tailwind.style('font-inter-580-24 text-[15px] text-white')}>
            {i18n.t('CONVERSATION.VOICE_WIDGET.RETURN_TO_CALL')}
          </Text>
          <Text
            style={tailwind.style(
              'font-inter-medium-24 text-[15px] text-white',
              flags.isConnected ? 'tabular-nums' : '',
            )}>
            {statusText}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};
