import React, { useCallback, useEffect } from 'react';
import { Image } from 'expo-image';

import { useAppDispatch, useAppSelector } from '@/hooks';
import { store } from '@/store';
import { callActions } from '@/store/call/callActions';
import {
  selectActiveCall,
  selectAudioRoute,
  selectIsJoining,
  selectIsMuted,
  selectIsOnHold,
  selectIsSpeakerOn,
} from '@/store/call/callSelectors';
import type { LiveCall } from '@/store/call/callTypes';
import { systemCall } from '@/services/voice/systemCall';
import { useHaptic } from '@/utils';

import { ActiveCallScreen } from './ActiveCallScreen';
import { IncomingCallsSheet } from './components/incoming-calls-sheet/IncomingCallsSheet';
import { useCallActions } from './hooks/useCallActions';
import { useCallDuration } from './hooks/useCallDuration';
import { useCallerInfo } from './hooks/useCallerInfo';
import { useRingingBehind } from './hooks/useRingingBehind';

type FullScreenCallProps = {
  call: LiveCall;
  onMinimise: () => void;
  onOpenConversation: () => void;
};

// The call screen with its controls wired to the call session. The in-app screen and the
// Android lock screen both show this, so a control exists in one place for both.
export const FullScreenCall = ({ call, onMinimise, onOpenConversation }: FullScreenCallProps) => {
  const dispatch = useAppDispatch();
  const hapticSelection = useHaptic();
  const activeCall = useAppSelector(selectActiveCall);
  const isJoining = useAppSelector(selectIsJoining);
  const isMuted = useAppSelector(selectIsMuted);
  const isSpeakerOn = useAppSelector(selectIsSpeakerOn);
  const isOnHold = useAppSelector(selectIsOnHold);
  const audioRoute = useAppSelector(selectAudioRoute);
  const info = useCallerInfo(call);
  const duration = useCallDuration(activeCall?.activeSince);
  const { answer, end, isEnding } = useCallActions(call, isJoining);
  const ringingBehind = useRingingBehind({ call, activeCall, isJoining });

  // The photo is fetched into the cache as soon as the call has one
  useEffect(() => {
    if (info.avatar) Image.prefetch(info.avatar, 'memory-disk').catch(() => {});
  }, [info.avatar]);

  const handleOpenConversation = useCallback(() => {
    hapticSelection?.();
    onOpenConversation();
  }, [hapticSelection, onOpenConversation]);

  return (
    <>
      <ActiveCallScreen
        call={call}
        info={info}
        duration={duration}
        isConnected={!!activeCall}
        isConnecting={isJoining}
        isIncoming={!activeCall && !isJoining && call.callDirection === 'inbound'}
        isJoining={isJoining}
        onAnswer={answer}
        isMuted={isMuted}
        isOnHold={isOnHold}
        isSpeakerOn={isSpeakerOn}
        audioRoute={audioRoute}
        isEnding={isEnding || !call.callSid}
        onMinimise={onMinimise}
        onToggleMute={() => systemCall.mute(store, call, !isMuted)}
        onToggleSpeaker={() => dispatch(callActions.toggleSpeaker())}
        onSelectAudioRoute={route => dispatch(callActions.selectAudioRoute(route))}
        onToggleHold={() => dispatch(callActions.toggleHold())}
        onEnd={end}
        onOpenConversation={handleOpenConversation}
      />
      {ringingBehind.calls.length ? (
        <IncomingCallsSheet
          calls={ringingBehind.calls}
          hasActiveCall={!!activeCall}
          startCollapsed={ringingBehind.rungBySystem}
          answerDisabled={isJoining}
          onAnswer={ringingBehind.answer}
          onDecline={ringingBehind.decline}
          onDeclineAll={ringingBehind.declineAll}
        />
      ) : null}
    </>
  );
};
