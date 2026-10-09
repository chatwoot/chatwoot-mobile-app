import React from 'react';
import { Pressable, Text } from 'react-native';

import { tailwind } from '@/theme';
import i18n from '@/i18n';
import { HandsetIcon } from '@/svg-icons';

import { CALL_GREEN } from './callBubbleTheme';
import { SpinningNotch } from './SpinningNotch';

type CallActionButtonProps = {
  label: string;
  // Answering a ring is the strong action; calling back is the quiet one
  tone: 'answer' | 'callback';
  inFlight: boolean;
  onPress: () => void;
};

type Colours = { background: string; foreground: string };

const TONES: Record<CallActionButtonProps['tone'], { idle: Colours; busy: Colours }> = {
  answer: {
    idle: { background: CALL_GREEN, foreground: '#FFFFFF' },
    busy: { background: CALL_GREEN, foreground: '#FFFFFF' },
  },
  callback: {
    idle: { background: '#EDEDF0', foreground: '#1C1C1E' },
    busy: { background: '#F4F4F6', foreground: '#8A8A90' },
  },
};

// The one action a call card offers, across the foot of the card. While it is in flight the
// handset turns into a spinning ring; a call back also reads "Calling…" and greys out.
export const CallActionButton = ({ label, tone, inFlight, onPress }: CallActionButtonProps) => {
  const { background, foreground } = TONES[tone][inFlight ? 'busy' : 'idle'];
  const shownLabel =
    inFlight && tone === 'callback' ? i18n.t('CONVERSATION.VOICE_WIDGET.CALLING') : label;
  // The answer button fades while it waits; the call back button says so instead
  const idleOpacity = inFlight && tone === 'answer' ? 0.55 : 1;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={shownLabel}
      accessibilityState={{ disabled: inFlight }}
      disabled={inFlight}
      onPress={onPress}
      style={({ pressed }) => [
        tailwind.style(
          'h-[38px] rounded-[10px] border-[1.5px] flex-row items-center justify-center gap-2',
        ),
        {
          backgroundColor: background,
          borderColor: background,
          opacity: pressed && !inFlight ? 0.8 : idleOpacity,
        },
      ]}>
      {inFlight ? (
        <SpinningNotch color={foreground} size={16} />
      ) : (
        <HandsetIcon color={foreground} size={16} />
      )}
      <Text
        style={[tailwind.style('font-inter-580-24 text-[14px] leading-5'), { color: foreground }]}>
        {shownLabel}
      </Text>
    </Pressable>
  );
};
