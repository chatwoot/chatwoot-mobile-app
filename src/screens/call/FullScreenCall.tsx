import React, { useCallback, useEffect, useState } from 'react';
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
  selectLocalCallSid,
} from '@/store/call/callSelectors';
import type { LiveCall } from '@/store/call/callTypes';
import { systemCall } from '@/services/voice/systemCall';
import { useHaptic } from '@/utils';

import { ActiveCallScreen } from './ActiveCallScreen';
import { IncomingCallsSheet } from './components/incoming-calls-sheet/IncomingCallsSheet';
import { useCallActions } from './hooks/useCallActions';
import { useCallerInfo } from './hooks/useCallerInfo';
import { useRingingBehind } from './hooks/useRingingBehind';

type FullScreenCallProps = {
  call: LiveCall;
  onMinimise: () => void;
  onOpenConversation: () => void;
  // Shown over the lock screen, where nothing else in the app may be reached
  onLockScreen?: boolean;
};

// The call screen with its controls wired to the call session. The in-app screen and the
// Android lock screen both show this, so a control exists in one place for both.
export const FullScreenCall = ({
  call,
  onMinimise,
  onOpenConversation,
  onLockScreen,
}: FullScreenCallProps) => {
  const dispatch = useAppDispatch();
  const hapticSelection = useHaptic();
  const activeCall = useAppSelector(selectActiveCall);
  const isJoining = useAppSelector(selectIsJoining);
  const localCallSid = useAppSelector(selectLocalCallSid);
  // Joining and connected describe the call on screen, not whichever call they belong to.
  // An inbound call this device has taken is connecting from the moment it is taken.
  const connectedThis = activeCall?.callSid === call.callSid;
  const joiningThis =
    localCallSid === call.callSid &&
    !connectedThis &&
    (isJoining || call.callDirection === 'inbound');
  const isMuted = useAppSelector(selectIsMuted);
  const isSpeakerOn = useAppSelector(selectIsSpeakerOn);
  const isOnHold = useAppSelector(selectIsOnHold);
  const audioRoute = useAppSelector(selectAudioRoute);
  const info = useCallerInfo(call);
  const { answer, end, isEnding } = useCallActions(call, joiningThis);
  const ringingBehind = useRingingBehind({ call, isJoining });
  // The strip of calls waiting behind this one steps aside while the route list is open
  const [routePickerOpen, setRoutePickerOpen] = useState(false);

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
        onLockScreen={onLockScreen}
        activeSince={activeCall?.activeSince}
        isConnected={connectedThis}
        isConnecting={joiningThis}
        isIncoming={!connectedThis && !joiningThis && call.callDirection === 'inbound'}
        isJoining={joiningThis}
        onAnswer={answer}
        isMuted={isMuted}
        isOnHold={isOnHold}
        isSpeakerOn={isSpeakerOn}
        audioRoute={audioRoute}
        isEnding={isEnding}
        onMinimise={onMinimise}
        onToggleMute={() => systemCall.mute(store, call, !isMuted)}
        onToggleSpeaker={() => dispatch(callActions.toggleSpeaker())}
        onSelectAudioRoute={route => dispatch(callActions.selectAudioRoute(route))}
        onToggleHold={() => dispatch(callActions.toggleHold())}
        onEnd={end}
        onOpenConversation={handleOpenConversation}
        onRoutePickerOpenChange={setRoutePickerOpen}
      />
      {ringingBehind.calls.length && !routePickerOpen ? (
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
