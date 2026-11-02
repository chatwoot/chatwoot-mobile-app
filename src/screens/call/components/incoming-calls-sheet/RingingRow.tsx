import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { tailwind } from '@/theme';
import i18n from '@/i18n';
import type { LiveCall } from '@/store/call/callTypes';

import { CALL_INK, CALL_LABEL_TEXT, CALL_LINK, CALL_RING_TEXT } from '../../constants/callTheme';
import { useCallerInfo } from '../../hooks/useCallerInfo';
import { useRingingFor } from '../../hooks/useRingingFor';
import { IncomingCallActions } from '../IncomingCallActions';
import { CallerMetaLine } from './CallerMetaLine';
import { RingingAvatar } from './RingingAvatar';

type RingingRowProps = {
  call: LiveCall;
  isOpen: boolean;
  hasActiveCall: boolean;
  answerDisabled?: boolean;
  onPress: () => void;
  onAnswer: () => void;
  onDecline: () => void;
};

export const RingingRow = ({
  call,
  isOpen,
  hasActiveCall,
  answerDisabled,
  onPress,
  onAnswer,
  onDecline,
}: RingingRowProps) => {
  const info = useCallerInfo(call);
  const ringingFor = useRingingFor(call.addedAt);

  return (
    <Animated.View
      layout={LinearTransition.duration(200)}
      exiting={FadeOut.duration(160)}
      style={tailwind.style(isOpen ? 'bg-gray-50' : 'bg-white')}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel={info.name}
        onPress={onPress}
        style={tailwind.style('h-[72px] px-5 flex-row items-center gap-3')}>
        <RingingAvatar name={info.name} uri={info.avatar || undefined} size="row" />
        <View style={tailwind.style('shrink-0 max-w-[50%] gap-[3px]')}>
          <Text
            numberOfLines={1}
            style={[
              tailwind.style('font-inter-580-24 text-[16px] leading-5 tracking-[-0.1px]'),
              { color: CALL_INK },
            ]}>
            {info.name}
          </Text>
          {info.phone ? (
            <Text
              numberOfLines={1}
              style={[
                tailwind.style('font-inter-420-20 text-[13px] leading-4 tabular-nums'),
                { color: CALL_LABEL_TEXT },
              ]}>
              {info.phone}
            </Text>
          ) : null}
        </View>
        <View style={tailwind.style('flex-1 min-w-0 items-end gap-[3px]')}>
          <View style={tailwind.style('flex-row items-center')}>
            <View
              style={[
                tailwind.style('h-1.5 w-1.5 rounded-full mr-1.5'),
                { backgroundColor: CALL_LINK },
              ]}
            />
            <Text
              style={[
                tailwind.style('font-inter-580-24 text-[12px] leading-4 tabular-nums'),
                { color: CALL_RING_TEXT },
              ]}>
              {i18n.t('CONVERSATION.VOICE_WIDGET.RINGING_FOR', { duration: ringingFor })}
            </Text>
          </View>
          <CallerMetaLine
            inboxName={info.inboxName}
            channelType={info.channelType}
            medium={info.medium}
            size="row"
          />
        </View>
      </Pressable>
      {isOpen ? (
        <Animated.View entering={FadeIn.duration(160)} style={tailwind.style('px-5 pb-4 gap-3')}>
          {hasActiveCall ? (
            <Text
              style={[
                tailwind.style('font-inter-420-20 text-center text-[13px] leading-[18px]'),
                { color: CALL_LABEL_TEXT },
              ]}>
              {i18n.t('CONVERSATION.VOICE_WIDGET.ANSWERING_THIS_ENDS_CURRENT')}
            </Text>
          ) : null}
          <IncomingCallActions
            onDecline={onDecline}
            onAnswer={onAnswer}
            answerDisabled={answerDisabled}
          />
        </Animated.View>
      ) : null}
    </Animated.View>
  );
};
