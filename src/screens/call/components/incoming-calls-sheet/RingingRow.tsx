import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import { Avatar } from '@/components-next/common/avatar/Avatar';
import { tailwind } from '@/theme';
import i18n from '@/i18n';
import { AnswerGlyph, EndGlyph } from '@/svg-icons';
import type { LiveCall } from '@/store/call/callTypes';

import { CALL_TONES } from '../../constants/callTheme';
import { useCallDuration } from '../../hooks/useCallDuration';
import { useCallerInfo } from '../../hooks/useCallerInfo';
import { useSwipeToAct, type SwipeAction } from '../../hooks/useSwipeToAct';
import { ChatwootMark } from '../ChatwootMark';
import { RevealButton } from './RevealButton';

const WHITE = '#FFFFFF';

type RingingRowProps = {
  call: LiveCall;
  index: number;
  // Set when every row is to fade out together, staggered by index
  fadeAll: boolean;
  // Resolve true once the action went through; false springs the row back
  onAnswer: () => Promise<boolean>;
  onDecline: () => Promise<boolean>;
  // The row has started leaving
  onLeaving: (action: SwipeAction) => void;
};

// One ringing caller as a swipeable card: who it is, which inbox, and how long they have
// waited. Swiping right answers, swiping left declines.
export const RingingRow = ({
  call,
  index,
  fadeAll,
  onAnswer,
  onDecline,
  onLeaving,
}: RingingRowProps) => {
  const first = index === 0;
  const info = useCallerInfo(call);
  const ringingFor = useCallDuration(call.addedAt);
  const swipe = useSwipeToAct({ first, index, fadeAll, onAnswer, onDecline, onLeaving });

  return (
    <Animated.View style={[tailwind.style('rounded-[18px] overflow-hidden'), swipe.wrapStyle]}>
      <RevealButton
        side="left"
        label={i18n.t('CONVERSATION.VOICE_WIDGET.END_AND_ANSWER')}
        style={swipe.answerButtonStyle}
        onPress={() => swipe.commit('answer')}>
        <AnswerGlyph color={WHITE} />
      </RevealButton>
      <RevealButton
        side="right"
        label={i18n.t('CONVERSATION.VOICE_WIDGET.REJECT_CALL')}
        style={swipe.declineButtonStyle}
        onPress={() => swipe.commit('decline')}>
        <EndGlyph color={WHITE} />
      </RevealButton>
      <GestureDetector gesture={swipe.gesture}>
        <Animated.View
          style={[
            tailwind.style(
              'h-20 flex-row items-center gap-3 px-3.5 rounded-[18px] border border-[#ECEDF0] overflow-hidden',
            ),
            first ? styles.rowFirst : null,
            swipe.cardStyle,
          ]}>
          <Animated.View
            pointerEvents="none"
            style={[tailwind.style('absolute inset-0'), swipe.tintStyle]}
          />
          <View style={tailwind.style('h-11 w-11 items-center justify-center')}>
            <Avatar
              size="3xl"
              name={info.name}
              src={info.avatar ? { uri: info.avatar } : undefined}
            />
          </View>
          <View style={tailwind.style('flex-1 min-w-0')}>
            <Text
              numberOfLines={1}
              style={tailwind.style(
                'font-inter-580-24 text-[16px] leading-5 tracking-[-0.1px] text-gray-950',
              )}>
              {info.name}
            </Text>
            <View style={tailwind.style('flex-row items-center gap-[5px] mt-[3px]')}>
              <ChatwootMark size={12} />
              <Text
                numberOfLines={1}
                style={tailwind.style(
                  'font-inter-420-20 text-[13px] leading-4 text-[#5C5C5C] tabular-nums',
                )}>
                {info.inboxName}
              </Text>
            </View>
            {info.phone ? (
              <Text
                style={tailwind.style(
                  'font-inter-420-20 text-[13px] leading-4 text-[#5C5C5C] tabular-nums',
                )}>
                {info.phone}
              </Text>
            ) : null}
          </View>
          <View
            style={tailwind.style(
              'h-6 px-[9px] rounded-xl flex-row items-center gap-[5px]',
              first ? 'bg-[rgba(11,126,217,0.14)]' : 'bg-[rgba(0,0,0,0.05)]',
            )}>
            {first ? (
              <View style={tailwind.style('h-1.5 w-1.5 rounded-[3px] bg-blue-800')} />
            ) : null}
            <Text
              style={[
                tailwind.style(
                  'font-inter-580-24 text-[12px] leading-[14px] text-[#5C5C5C] tabular-nums',
                ),
                first ? { color: CALL_TONES.ringing.status } : null,
              ]}>
              {ringingFor}
            </Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};

// The first card's iOS shadow, which Tailwind cannot express
const styles = StyleSheet.create({
  rowFirst:
    Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 9,
          shadowOffset: { width: 0, height: 6 },
        }
      : { borderColor: '#E6E7EA' },
});
