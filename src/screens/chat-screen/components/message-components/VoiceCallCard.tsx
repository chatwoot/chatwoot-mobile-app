import React, { useMemo, useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { MESSAGE_VARIANTS } from '@/constants';
import type { Message } from '@/types';
import { tailwind } from '@/theme';
import { AudioBubblePlayer } from './AudioBubble';
import { setPlayerSpeed } from '../audio-recorder';
import i18n from '@/i18n';
import { getVoiceCallDisplay } from './voiceCallCardUtils';

type VoiceCallCardProps = {
  message: Message;
};

const DownloadIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <Path
      d="M9 2V11M9 11L5.5 7.5M9 11L12.5 7.5M3 14.5H15"
      stroke="#11181C"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PhoneCallEndedIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 6L18 8L22 4M13.832 16.568A1 1 0 0 0 15.045 16.265L15.4 15.8A2 2 0 0 1 17 15H20A2 2 0 0 1 22 17V20A2 2 0 0 1 20 22A18 18 0 0 1 2 4A2 2 0 0 1 4 2H7A2 2 0 0 1 9 4V7A2 2 0 0 1 8.2 8.6L7.732 8.951A1 1 0 0 0 7.44 10.184A14 14 0 0 0 13.832 16.568Z"
      stroke="white"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PhoneCallIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 4H20M20 4V10M20 4L14 10M13.832 16.568A1 1 0 0 0 15.045 16.265L15.4 15.8A2 2 0 0 1 17 15H20A2 2 0 0 1 22 17V20A2 2 0 0 1 20 22A18 18 0 0 1 2 4A2 2 0 0 1 4 2H7A2 2 0 0 1 9 4V7A2 2 0 0 1 8.2 8.6L7.732 8.951A1 1 0 0 0 7.44 10.184A14 14 0 0 0 13.832 16.568Z"
      stroke="white"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const VoiceCallCard = ({ message }: VoiceCallCardProps) => {
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const callDisplay = useMemo(() => getVoiceCallDisplay(message), [message]);
  const title = callDisplay.titleKey ? i18n.t(callDisplay.titleKey) : callDisplay.fallbackTitle;
  const details = [...callDisplay.detailKeys.map(key => i18n.t(key)), callDisplay.duration].filter(
    Boolean,
  );

  const togglePlaybackSpeed = async () => {
    const nextSpeed = playbackSpeed === 1 ? 2 : 1;
    setPlaybackSpeed(nextSpeed);
    await setPlayerSpeed(nextSpeed);
  };

  return (
    <Animated.View style={tailwind.style('min-w-[260px] rounded-[13px] bg-blue-100 p-3')}>
      <View style={tailwind.style('flex-row items-center')}>
        <View
          style={tailwind.style('h-12 w-12 items-center justify-center rounded-full bg-gray-700')}>
          {callDisplay.isEnded ? <PhoneCallEndedIcon /> : <PhoneCallIcon />}
        </View>
        <View style={tailwind.style('ml-3 flex-1')}>
          <Animated.Text style={tailwind.style('text-base font-inter-580-24 text-gray-950')}>
            {title}
          </Animated.Text>
          {details.map(detail => (
            <Animated.Text
              key={detail}
              numberOfLines={1}
              style={tailwind.style('text-sm font-inter-420-20 text-gray-700')}>
              {detail}
            </Animated.Text>
          ))}
        </View>
      </View>

      {!!callDisplay.recordingUrl && (
        <Animated.View
          style={tailwind.style(
            'mt-3 flex-row items-center rounded-[13px] border border-blackA-A3 bg-white px-3 py-2',
          )}>
          <AudioBubblePlayer audioSrc={callDisplay.recordingUrl} variant={MESSAGE_VARIANTS.AGENT} />
          <Pressable
            accessibilityRole="button"
            onPress={togglePlaybackSpeed}
            hitSlop={8}
            style={tailwind.style('ml-2 rounded-full bg-gray-100 px-3 py-1')}>
            <Animated.Text style={tailwind.style('text-sm font-inter-medium-24 text-gray-700')}>
              {playbackSpeed}x
            </Animated.Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => Linking.openURL(callDisplay.recordingUrl)}
            hitSlop={8}
            style={tailwind.style('ml-2')}>
            <DownloadIcon />
          </Pressable>
        </Animated.View>
      )}
      {!!callDisplay.note && (
        <Animated.View style={tailwind.style('mt-3 border-t border-t-blackA-A3 pt-3')}>
          <Animated.Text
            numberOfLines={4}
            style={tailwind.style('text-xs font-inter-420-20 text-gray-950')}>
            {callDisplay.note}
          </Animated.Text>
        </Animated.View>
      )}
    </Animated.View>
  );
};
