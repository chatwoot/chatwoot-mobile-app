import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { tailwind } from '@/theme';
import i18n from '@/i18n';
import {
  CaretRightBoldGlyph,
  PhoneCallIcon,
  PhoneIncomingIcon,
  PhoneMissedIcon,
  PhoneOutgoingIcon,
} from '@/svg-icons';

import {
  CALL_BLUE,
  CALL_BUBBLE_TONES,
  CALL_GREEN,
  CARD_INK,
  CARD_MUTED,
  CARD_SURFACE,
  type CallBubbleState,
} from './callBubbleTheme';
import { LiveDot } from './LiveDot';

const StateIcon = ({
  state,
  isOutbound,
  colour,
}: {
  state: CallBubbleState;
  isOutbound: boolean;
  colour: string;
}) => {
  if (state === 'missed') return <PhoneMissedIcon color={colour} />;
  if (state === 'live') return <PhoneCallIcon color={colour} />;
  return isOutbound ? <PhoneOutgoingIcon color={colour} /> : <PhoneIncomingIcon color={colour} />;
};

type CallStatusCardProps = {
  state: CallBubbleState;
  isOutbound: boolean;
  title: string;
  subtitle: string;
  duration?: string;
  onOpenCall?: () => void;
  children?: React.ReactNode;
};

export const CallStatusCard = ({
  state,
  isOutbound,
  title,
  subtitle,
  duration,
  onOpenCall,
  children,
}: CallStatusCardProps) => {
  const tone = CALL_BUBBLE_TONES[state];
  const isRinging = state === 'ringing' && !isOutbound;
  const iconColour = state === 'ended' && isOutbound ? CARD_INK : tone.icon;

  const card = (
    <View
      style={[
        tailwind.style('-ml-[7px] -mr-[5px] -mt-[3px] rounded-[14px] px-3 py-[11px] gap-2.5'),
        { backgroundColor: CARD_SURFACE },
      ]}>
      <View style={tailwind.style('flex-row items-center gap-3')}>
        <View
          style={[
            tailwind.style('h-[38px] w-[38px] rounded-[10px] items-center justify-center'),
            { backgroundColor: tone.iconBox },
          ]}>
          <StateIcon state={state} isOutbound={isOutbound} colour={iconColour} />
        </View>
        <View style={tailwind.style('flex-1 min-w-0')}>
          <View style={tailwind.style('flex-row items-center gap-2')}>
            <Text
              numberOfLines={1}
              style={[
                tailwind.style('font-inter-580-24 text-[15px] leading-5'),
                { color: CARD_INK },
              ]}>
              {title}
            </Text>
            {state === 'live' || isRinging ? (
              <LiveDot
                colour={isRinging ? CALL_BLUE : CALL_GREEN}
                periodMs={isRinging ? 1100 : 1600}
              />
            ) : null}
            {duration ? (
              <Text
                style={[
                  tailwind.style('ml-auto font-inter-medium-24 text-[13px] leading-5 tabular-nums'),
                  { color: CARD_MUTED },
                ]}>
                {duration}
              </Text>
            ) : null}
          </View>
          {subtitle ? (
            <Text
              numberOfLines={1}
              style={[
                tailwind.style('font-inter-420-20 text-[13px] leading-[18px] mt-px'),
                { color: CARD_MUTED },
              ]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {onOpenCall ? (
          <View style={tailwind.style('mt-px')}>
            <CaretRightBoldGlyph color={CARD_MUTED} size={18} />
          </View>
        ) : null}
      </View>
      {children}
    </View>
  );

  if (!onOpenCall) return card;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={i18n.t('CONVERSATION.VOICE_WIDGET.RETURN_TO_CALL')}
      onPress={onOpenCall}
      style={({ pressed }) => (pressed ? tailwind.style('opacity-80') : null)}>
      {card}
    </Pressable>
  );
};
