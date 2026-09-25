import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';

import { tailwind } from '@/theme';

import { HANDSET_PATH } from '@/svg-icons';

import { CALL_GREEN, CALL_LINK } from './callBubbleTheme';

type CallActionButtonProps = {
  label: string;
  // Answering a ring is the strong action; calling back is the quiet one
  tone: 'answer' | 'callback';
  inFlight: boolean;
  onPress: () => void;
};

const TONES = {
  answer: { background: CALL_GREEN, border: CALL_GREEN, foreground: '#FFFFFF' },
  callback: { background: 'rgba(14,142,255,0.1)', border: 'transparent', foreground: CALL_LINK },
};

// The one action a call card offers, across the foot of the card
export const CallActionButton = ({ label, tone, inFlight, onPress }: CallActionButtonProps) => {
  const { background, border, foreground } = TONES[tone];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inFlight }}
      disabled={inFlight}
      onPress={onPress}
      style={({ pressed }) => [
        tailwind.style(
          'h-[38px] rounded-[10px] border-[1.5px] flex-row items-center justify-center gap-2',
        ),
        {
          backgroundColor: background,
          borderColor: border,
          opacity: inFlight ? 0.55 : pressed ? 0.8 : 1,
        },
      ]}>
      {inFlight ? (
        <ActivityIndicator size="small" color={foreground} />
      ) : (
        <View style={tailwind.style('h-4 w-4')}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path
              d={HANDSET_PATH}
              stroke={foreground}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      )}
      <Text
        style={[tailwind.style('font-inter-580-24 text-[14px] leading-5'), { color: foreground }]}>
        {label}
      </Text>
    </Pressable>
  );
};
