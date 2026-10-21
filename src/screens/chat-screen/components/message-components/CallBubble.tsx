import React, { useMemo } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { Message } from '@/types';
import i18n from '@/i18n';
import { MESSAGE_VARIANTS, VOICE_CALL_STATUS } from '@/constants';
import { getVoiceCallDisplay } from '@/utils/voiceCallUtils';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectFullScreenCall } from '@/store/call/callSelectors';
import { setMinimised } from '@/store/call/callSlice';

import { AudioBubble } from './AudioBubble';
import { CallActionButton } from './call-bubble/CallActionButton';
import { CallStatusCard } from './call-bubble/CallStatusCard';
import { CallTranscript } from './call-bubble/CallTranscript';
import type { CallBubbleState } from './call-bubble/callBubbleTheme';
import { useCallBubbleActions } from './call-bubble/useCallBubbleActions';

type CallBubbleProps = {
  item: Message;
  variant: string;
};

const isLightOnDark = (variant: string) =>
  variant === MESSAGE_VARIANTS.USER || variant === MESSAGE_VARIANTS.ERROR;

const callState = (display: ReturnType<typeof getVoiceCallDisplay>): CallBubbleState => {
  if (display.isFailed) return 'missed';
  if (display.status === VOICE_CALL_STATUS.IN_PROGRESS) return 'live';
  if (display.status === VOICE_CALL_STATUS.COMPLETED) return 'ended';
  return 'ringing';
};

// A call in the conversation, on a card inset into the message bubble: which way it went
// and how it ended, the one action it offers, and the recording and transcript it left.
export const CallBubble = ({ item, variant }: CallBubbleProps) => {
  const display = useMemo(() => getVoiceCallDisplay(item), [item]);
  const dispatch = useAppDispatch();
  const liveCall = useAppSelector(selectFullScreenCall);
  const actions = useCallBubbleActions(item, display);
  const callSid = item.call?.providerCallId;
  // The card opens the call screen while this device is on that very call
  const isThisDevicesCall = !!liveCall && !!callSid && liveCall.callSid === callSid;

  const state = callState(display);
  const lightOnDark = isLightOnDark(variant);
  const subtitle = display.subtextKey ? i18n.t(display.subtextKey, display.subtextParams) : '';

  return (
    <Animated.View style={tailwind.style('gap-3 min-w-[240px]')}>
      <CallStatusCard
        state={state}
        isOutbound={display.isOutbound}
        title={i18n.t(display.labelKey)}
        subtitle={subtitle}
        duration={state === 'ended' ? display.duration : undefined}
        onOpenCall={isThisDevicesCall ? () => dispatch(setMinimised(false)) : undefined}>
        {actions.canJoinCall ? (
          <CallActionButton
            label={i18n.t('CONVERSATION.VOICE_CALL.JOIN_CALL')}
            tone="answer"
            inFlight={actions.isJoining}
            onPress={actions.joinCall}
          />
        ) : null}
        {actions.canCallBack ? (
          <CallActionButton
            label={i18n.t('CONVERSATION.VOICE_CALL.CALL_BACK')}
            tone="callback"
            inFlight={actions.isCallingBack}
            onPress={actions.callBack}
          />
        ) : null}
      </CallStatusCard>

      {display.recording ? (
        <View style={tailwind.style('flex-row items-center')}>
          <AudioBubble
            audioSrc={display.recording.dataUrl}
            contentType={display.recording.contentType}
            extension={display.recording.extension}
            variant={variant}
          />
        </View>
      ) : null}

      {display.transcript ? (
        <CallTranscript text={display.transcript} lightOnDark={lightOnDark} />
      ) : null}
    </Animated.View>
  );
};
