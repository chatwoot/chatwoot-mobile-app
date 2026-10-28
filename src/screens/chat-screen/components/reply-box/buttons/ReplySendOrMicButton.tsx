import { useTailwind } from '@/theme/useTailwind';
import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Icon } from '@/components-next/common';
import { useAppSelector } from '@/hooks';
import { selectIsPrivateMessage } from '@/store/conversation/sendMessageSlice';
import { SendIcon } from '@/svg-icons';

import { VoiceRecordButton } from './VoiceRecordButton';

type ReplySendOrMicButtonProps = {
  showSend: boolean;
  showMic: boolean;
  onSend: () => void;
  onMic: () => void;
};

// iPhone Duo reply bar: the mic and send buttons share one spot. The mic stays mounted and
// the send button fades and scales in over it, so swapping them as you type doesn't
// remount the glass or shift the layout (which made it flicker).
export const ReplySendOrMicButton = ({
  showSend,
  showMic,
  onSend,
  onMic,
}: ReplySendOrMicButtonProps) => {
  const tailwind = useTailwind();
  const isPrivateMessage = useAppSelector(selectIsPrivateMessage);
  const progress = useSharedValue(showSend ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(showSend ? 1 : 0, { duration: 160 });
  }, [showSend, progress]);

  const sendStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.6 + progress.value * 0.4 }],
  }));
  const micStyle = useAnimatedStyle(() => ({ opacity: 1 - progress.value }));

  if (!showMic && !showSend) return null;

  return (
    <View style={tailwind.style('h-9 w-9')}>
      {showMic ? (
        <Animated.View style={micStyle} pointerEvents={showSend ? 'none' : 'auto'}>
          <VoiceRecordButton glass onPress={onMic} />
        </Animated.View>
      ) : null}
      <Animated.View
        pointerEvents={showSend ? 'auto' : 'none'}
        style={[tailwind.style('absolute inset-0'), sendStyle]}>
        <Pressable
          onPress={onSend}
          accessibilityRole="button"
          style={({ pressed }) =>
            tailwind.style(
              'h-9 w-9 rounded-full items-center justify-center',
              isPrivateMessage ? 'bg-amber-700' : 'bg-blue-800',
              pressed && 'opacity-80',
            )
          }>
          <Icon icon={<SendIcon strokeWidth={2.4} />} size={20} />
        </Pressable>
      </Animated.View>
    </View>
  );
};
