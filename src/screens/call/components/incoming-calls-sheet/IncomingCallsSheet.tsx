import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tailwind } from '@/theme';
import i18n from '@/i18n';
import type { LiveCall } from '@/store/call/callTypes';

import { solidSurface } from '../../constants/callTheme';
import { useCallerInfo } from '../../hooks/useCallerInfo';
import { useSheetDismissal } from '../../hooks/useSheetDismissal';
import type { SwipeAction } from '../../hooks/useSwipeToAct';
import { GlassSurface } from '../GlassSurface';
import { IncomingCallActions } from '../IncomingCallActions';
import { PulseDot } from '../PulseDot';
import { CollapsedCallsStrip } from './CollapsedCallsStrip';
import { DeclineAllButton } from './DeclineAllButton';
import { RingingRow } from './RingingRow';
import { SingleCallerCard } from './SingleCallerCard';

type IncomingCallsSheetProps = {
  // Ringing calls, longest waiting first
  calls: LiveCall[];
  // A call is up, so answering ends it
  hasActiveCall: boolean;
  // The OS is already prompting for the calls, so the sheet opens only from the strip
  startCollapsed?: boolean;
  answerDisabled?: boolean;
  onAnswer: (call: LiveCall) => Promise<boolean>;
  onDecline: (call: LiveCall) => Promise<boolean>;
  onDeclineAll: () => void;
};

// Calls ringing while another call is on screen. One caller gets a block with two wide
// buttons; two or more become row cards. The sheet slides away once a call is taken or
// nothing is left ringing, and a swipe down leaves a strip above the tray with the count;
// a tap on the strip brings the sheet back.
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
  const [fadeAll, setFadeAll] = useState(false);
  const [leavingSids, setLeavingSids] = useState<string[]>([]);
  const single = calls.length === 1 ? calls[0] : null;
  const singleInfo = useCallerInfo(single);

  const resetRows = useCallback(() => {
    setFadeAll(false);
    setLeavingSids([]);
  }, []);
  const sheet = useSheetDismissal(resetRows, startCollapsed);

  // Rows still on their way out do not count as ringing any more
  const live = useMemo(
    () => calls.filter(entry => !leavingSids.includes(entry.callSid)).length,
    [calls, leavingSids],
  );
  const footerAlpha = useSharedValue(1);
  useEffect(() => {
    footerAlpha.value = withTiming(live === 0 ? 0 : 1, { duration: 250 });
  }, [footerAlpha, live]);
  const footerStyle = useAnimatedStyle(() => ({
    opacity: footerAlpha.value,
    transform: [{ translateY: (1 - footerAlpha.value) * 6 }],
  }));

  const rowLeaving = useCallback(
    (sid: string, action: SwipeAction) => {
      setLeavingSids(current => (current.includes(sid) ? current : [...current, sid]));
      const remaining = calls.filter(
        entry => entry.callSid !== sid && !leavingSids.includes(entry.callSid),
      );
      if (action === 'answer') setTimeout(sheet.closeSheet, 300);
      else if (remaining.length === 0) setTimeout(sheet.closeSheet, 140);
    },
    [calls, leavingSids, sheet.closeSheet],
  );

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
  const declineAll = () => {
    setFadeAll(true);
    setLeavingSids(calls.map(entry => entry.callSid));
    setTimeout(sheet.closeSheet, 60);
    onDeclineAll();
  };

  const title = single
    ? i18n.t('CONVERSATION.VOICE_WIDGET.INCOMING_CALL')
    : i18n.t('CONVERSATION.VOICE_WIDGET.INCOMING_CALLS_COUNT', { count: calls.length });
  const answerLabel = hasActiveCall
    ? i18n.t('CONVERSATION.VOICE_WIDGET.END_AND_ANSWER')
    : i18n.t('CONVERSATION.VOICE_WIDGET.JOIN_CALL');

  if (sheet.collapsed) return <CollapsedCallsStrip label={title} onPress={sheet.expand} />;

  return (
    <View style={tailwind.style('absolute inset-0')} pointerEvents="box-none">
      <Animated.View
        entering={FadeIn.duration(180)}
        exiting={FadeOut.duration(140)}
        style={[tailwind.style('absolute inset-0 bg-[rgba(20,20,26,0.28)]'), sheet.scrimStyle]}>
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
          <GlassSurface
            style={[
              tailwind.style('rounded-t-[34px] pt-2.5 px-5'),
              { paddingBottom: insets.bottom + 12 },
            ]}
            fallbackStyle={solidSurface(34, 'card')}>
            <View
              style={tailwind.style('self-center h-[5px] w-9 rounded-[3px] bg-[#CCCCCC] mb-3.5')}
            />
            <Animated.View style={[tailwind.style('flex-row items-center gap-2'), footerStyle]}>
              <PulseDot />
              <Text
                style={tailwind.style(
                  'font-inter-580-24 uppercase text-[13px] leading-4 tracking-[0.4px]',
                )}>
                {title}
              </Text>
            </Animated.View>

            {single ? (
              <SingleCallerCard info={singleInfo} />
            ) : (
              <ScrollView
                style={tailwind.style('h-[252px] mt-2.5 -mx-3.5')}
                contentContainerStyle={tailwind.style('px-3.5 gap-1.5 pb-3')}
                showsVerticalScrollIndicator={false}
                scrollEnabled={calls.length > 3}
                bounces={calls.length > 3}>
                {calls.map((entry, index) => (
                  <RingingRow
                    key={entry.callSid}
                    call={entry}
                    index={index}
                    fadeAll={fadeAll}
                    onAnswer={() => onAnswer(entry)}
                    onDecline={() => onDecline(entry)}
                    onLeaving={action => rowLeaving(entry.callSid, action)}
                  />
                ))}
              </ScrollView>
            )}

            <Animated.View style={footerStyle}>
              {hasActiveCall ? (
                <Text
                  style={tailwind.style(
                    'font-inter-420-20 mt-3 text-center text-[13px] leading-4 text-[#737373]',
                  )}>
                  {i18n.t('CONVERSATION.VOICE_WIDGET.ANSWERING_ENDS_CURRENT')}
                </Text>
              ) : null}
              {single ? (
                <View style={tailwind.style('mt-3.5 mx-4')}>
                  <IncomingCallActions
                    onDecline={declineSingle}
                    onAnswer={answerSingle}
                    answerLabel={answerLabel}
                    answerDisabled={answerDisabled}
                  />
                </View>
              ) : (
                <>
                  <Text
                    style={tailwind.style(
                      'font-inter-420-20 mt-1 text-center text-[12px] leading-4 text-[#757575]',
                    )}>
                    {i18n.t('CONVERSATION.VOICE_WIDGET.SWIPE_HINT')}
                  </Text>
                  <DeclineAllButton onPress={declineAll} />
                </>
              )}
            </Animated.View>
          </GlassSurface>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};
