import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut, SlideInDown, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tailwind } from '@/theme';
import { useHaptic } from '@/utils';
import i18n from '@/i18n';
import type { LiveCall } from '@/store/call/callTypes';

import {
  CALL_DIVIDER,
  CALL_LABEL_TEXT,
  CALL_RING_TEXT,
  CARD_SHADOW,
  SHEET_SHADOW,
} from '../../constants/callTheme';
import { SHEET_CLOSE_MS } from '../../constants/sheet';
import { SWIPE_ROW_HEIGHT } from '../../constants/swipeRow';
import { useCallerInfo } from '../../hooks/useCallerInfo';
import { useSheetDismissal } from '../../hooks/useSheetDismissal';
import { IncomingCallActions } from '../IncomingCallActions';
import { PulseDot } from '../PulseDot';
import { CollapsedCallsStrip } from './CollapsedCallsStrip';
import { DeclineAllButton } from './DeclineAllButton';
import { RingingRow } from './RingingRow';
import { SingleCallerCard } from './SingleCallerCard';

const HINT_TEXT = 'font-inter-420-20 text-center text-[13px] leading-[18px]';
const LIST_VISIBLE_ROWS = 4;
const LIST_MAX_HEIGHT = LIST_VISIBLE_ROWS * (SWIPE_ROW_HEIGHT + 1) + 1;

type IncomingCallsSheetProps = {
  calls: LiveCall[];
  hasActiveCall: boolean;
  startCollapsed?: boolean;
  answerDisabled?: boolean;
  onAnswer: (call: LiveCall) => Promise<boolean>;
  onDecline: (call: LiveCall) => Promise<boolean>;
  onDeclineAll: () => Promise<string[]>;
};

export const IncomingCallsSheet = ({
  calls,
  hasActiveCall,
  startCollapsed = false,
  answerDisabled,
  onAnswer,
  onDecline,
  onDeclineAll,
}: IncomingCallsSheetProps) => {
  const insets = useSafeAreaInsets();
  const single = calls.length === 1 ? calls[0] : null;
  const singleInfo = useCallerInfo(single);
  const sheet = useSheetDismissal(startCollapsed);
  const openedRowIndex = useSharedValue<number | null>(null);
  const [decliningSids, setDecliningSids] = useState<string[]>([]);
  const hapticSelection = useHaptic();

  const answerRow = async (call: LiveCall) => {
    if (await onAnswer(call)) sheet.closeSheet();
  };

  const answerSingle = async () => {
    if (!single) return;
    setTimeout(sheet.closeSheet, 300);
    const ok = await onAnswer(single);
    if (!ok) sheet.expand();
  };
  const declineSingle = async () => {
    if (!single) return;
    setTimeout(sheet.closeSheet, 140);
    const ok = await onDecline(single);
    if (!ok) sheet.expand();
  };
  // The sheet slides away before the calls end, so no row leaves mid-slide; only a
  // call whose decline fails comes back to the collapsed strip
  const declineAll = () => {
    hapticSelection?.();
    setDecliningSids(calls.map(entry => entry.callSid));
    sheet.closeSheet();
    setTimeout(async () => {
      const failed = await onDeclineAll();
      setDecliningSids(current => current.filter(sid => !failed.includes(sid)));
    }, SHEET_CLOSE_MS);
  };

  const title = single
    ? i18n.t('CONVERSATION.VOICE_WIDGET.INCOMING_CALL')
    : i18n.t('CONVERSATION.VOICE_WIDGET.INCOMING_CALLS_COUNT', { count: calls.length });
  const answerLabel = hasActiveCall
    ? i18n.t('CONVERSATION.VOICE_WIDGET.END_AND_ANSWER')
    : i18n.t('CONVERSATION.VOICE_WIDGET.JOIN_CALL');

  if (sheet.collapsed) {
    const waiting = calls.filter(entry => !decliningSids.includes(entry.callSid)).length;
    if (!waiting) return null;
    const label =
      waiting === 1
        ? i18n.t('CONVERSATION.VOICE_WIDGET.INCOMING_CALL')
        : i18n.t('CONVERSATION.VOICE_WIDGET.INCOMING_CALLS_COUNT', { count: waiting });
    return <CollapsedCallsStrip label={label} onPress={sheet.expand} />;
  }

  return (
    <View style={tailwind.style('absolute inset-0')} pointerEvents="box-none">
      <Animated.View
        entering={FadeIn.duration(180)}
        exiting={FadeOut.duration(140)}
        style={[tailwind.style('absolute inset-0 bg-call-scrim'), sheet.scrimStyle]}>
        <Pressable
          accessibilityRole="button"
          onPress={sheet.collapse}
          style={tailwind.style('absolute inset-0')}
        />
      </Animated.View>
      <GestureDetector gesture={sheet.pan}>
        <Animated.View
          entering={SlideInDown.duration(260)}
          style={[tailwind.style('absolute left-0 right-0 bottom-0'), sheet.sheetStyle]}>
          <View
            style={[
              tailwind.style('rounded-t-[34px] bg-white pt-2.5', single ? 'px-5' : ''),
              single ? CARD_SHADOW : SHEET_SHADOW,
              { paddingBottom: insets.bottom + 12 },
            ]}>
            <View
              style={tailwind.style('self-center h-[5px] w-9 rounded-[3px] bg-[#CCCCCC] mb-3.5')}
            />
            <View style={tailwind.style('flex-row items-center gap-2', single ? '' : 'px-5')}>
              <PulseDot />
              <Text
                style={[
                  tailwind.style(
                    'font-inter-580-24 uppercase text-[13px] leading-4 tracking-[0.4px]',
                  ),
                  { color: CALL_RING_TEXT },
                ]}>
                {title}
              </Text>
            </View>

            {single ? (
              <SingleCallerCard info={singleInfo} />
            ) : (
              <ScrollView
                style={[
                  tailwind.style('mt-4 border-t border-b'),
                  { maxHeight: LIST_MAX_HEIGHT, borderColor: CALL_DIVIDER },
                ]}
                contentContainerStyle={[
                  tailwind.style('gap-px'),
                  { backgroundColor: CALL_DIVIDER },
                ]}
                showsVerticalScrollIndicator={false}
                scrollEnabled={calls.length > LIST_VISIBLE_ROWS}
                bounces={calls.length > LIST_VISIBLE_ROWS}>
                {calls.map((entry, index) => (
                  <RingingRow
                    key={entry.callSid}
                    call={entry}
                    index={index}
                    openedRowIndex={openedRowIndex}
                    onAnswer={() => answerRow(entry)}
                    onDecline={() => onDecline(entry)}
                  />
                ))}
              </ScrollView>
            )}

            <View>
              {single ? (
                <>
                  {hasActiveCall ? (
                    <Text style={[tailwind.style(HINT_TEXT, 'mt-4'), { color: CALL_LABEL_TEXT }]}>
                      {i18n.t('CONVERSATION.VOICE_WIDGET.ANSWERING_ENDS_CURRENT')}
                    </Text>
                  ) : null}
                  <View style={tailwind.style('mt-3.5 mx-4')}>
                    <IncomingCallActions
                      onDecline={declineSingle}
                      onAnswer={answerSingle}
                      answerLabel={answerLabel}
                      answerDisabled={answerDisabled}
                    />
                  </View>
                </>
              ) : (
                <>
                  <Text
                    style={[tailwind.style(HINT_TEXT, 'py-4 px-5'), { color: CALL_LABEL_TEXT }]}>
                    {i18n.t(
                      hasActiveCall
                        ? 'CONVERSATION.VOICE_WIDGET.SWIPE_HINT_ENDS_CURRENT'
                        : 'CONVERSATION.VOICE_WIDGET.SWIPE_HINT',
                    )}
                  </Text>
                  <View style={tailwind.style('flex-row mx-5')}>
                    <DeclineAllButton onPress={declineAll} />
                  </View>
                </>
              )}
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};
