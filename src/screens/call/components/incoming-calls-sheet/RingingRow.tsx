import React from 'react';
import { Text, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import i18n from '@/i18n';
import { AnswerGlyph, EndGlyph } from '@/svg-icons';
import type { LiveCall } from '@/store/call/callTypes';

import {
  CALL_ANSWER,
  CALL_END,
  CALL_INK,
  CALL_LINK,
  CALL_RING_TEXT,
} from '../../constants/callTheme';
import { useCallerInfo } from '../../hooks/useCallerInfo';
import { useRingingFor } from '../../hooks/useRingingFor';
import { useSwipeToAct, type SwipeAction } from '../../hooks/useSwipeToAct';
import { CallerMetaLine } from './CallerMetaLine';
import { RevealPanel } from './RevealPanel';
import { RingingAvatar } from './RingingAvatar';

const WHITE = '#FFFFFF';

type RingingRowProps = {
  call: LiveCall;
  index: number;
  // Set when every row is to leave together, as declined
  declineAll: boolean;
  // Resolve true once the action went through; false brings the row back
  onAnswer: () => Promise<boolean>;
  onDecline: () => Promise<boolean>;
  // The row has started leaving
  onLeaving: (action: SwipeAction) => void;
};

// One ringing caller as a swipeable row: who it is, the number and inbox, and how long they
// have waited. Swiping right answers, swiping left declines.
export const RingingRow = ({
  call,
  index,
  declineAll,
  onAnswer,
  onDecline,
  onLeaving,
}: RingingRowProps) => {
  const info = useCallerInfo(call);
  const ringingFor = useRingingFor(call.addedAt);
  const swipe = useSwipeToAct({ index, declineAll, onAnswer, onDecline, onLeaving });

  return (
    <Animated.View style={[tailwind.style('overflow-hidden bg-white'), swipe.wrapStyle]}>
      <RevealPanel
        side="left"
        label={i18n.t('CONVERSATION.VOICE_WIDGET.JOIN_CALL')}
        colour={CALL_ANSWER}
        style={swipe.answerPanelStyle}
        onPress={() => swipe.commit('answer')}>
        <AnswerGlyph color={WHITE} size={22} />
      </RevealPanel>
      <RevealPanel
        side="right"
        label={i18n.t('CONVERSATION.VOICE_WIDGET.REJECT_CALL')}
        colour={CALL_END}
        style={swipe.declinePanelStyle}
        onPress={() => swipe.commit('decline')}>
        <EndGlyph color={WHITE} size={22} />
      </RevealPanel>
      <GestureDetector gesture={swipe.gesture}>
        <Animated.View
          style={[
            tailwind.style('h-[72px] px-5 flex-row items-center gap-3 bg-white'),
            swipe.rowStyle,
          ]}>
          <RingingAvatar name={info.name} uri={info.avatar || undefined} size="row" />
          <View style={tailwind.style('flex-1 min-w-0 gap-[3px]')}>
            <View style={tailwind.style('flex-row items-center gap-2')}>
              <Text
                numberOfLines={1}
                style={[
                  tailwind.style(
                    'flex-1 min-w-0 font-inter-580-24 text-[16px] leading-5 tracking-[-0.1px]',
                  ),
                  { color: CALL_INK },
                ]}>
                {info.name}
              </Text>
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
            </View>
            <CallerMetaLine
              phone={info.phone}
              inboxName={info.inboxName}
              channelType={info.channelType}
              medium={info.medium}
              size="row"
            />
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};
