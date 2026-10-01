import React, { useCallback } from 'react';
import { View } from 'react-native';

import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  selectActiveCall,
  selectFullScreenCall,
  selectIsCallMinimised,
  selectIsJoining,
  selectIsOnHold,
  selectLocalCallSid,
} from '@/store/call/callSelectors';
import { setMinimised } from '@/store/call/callSlice';
import type { LiveCall } from '@/store/call/callTypes';

import { CALL_BANNER_ROW_HEIGHT, CallBanner } from './components/CallBanner';

// The same phases the call screen shows, for the call behind the bar
const bannerFlags = (
  call: LiveCall,
  activeSid: string | undefined,
  joining: boolean,
  isOnHold: boolean,
) => {
  const isConnected = activeSid === call.callSid;
  return {
    isOnHold: isConnected && isOnHold,
    isConnected,
    isConnecting: joining,
    isIncoming: !isConnected && !joining && call.callDirection === 'inbound',
  };
};

// Wraps the whole app so the ongoing-call bar has room of its own: the screens move down
// by the bar's row and their safe-area padding sits under the bar's status-bar half.
export const OngoingCallBar = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const call = useAppSelector(selectFullScreenCall);
  const activeCall = useAppSelector(selectActiveCall);
  const isMinimised = useAppSelector(selectIsCallMinimised);
  const isJoining = useAppSelector(selectIsJoining);
  const localCallSid = useAppSelector(selectLocalCallSid);
  const isOnHold = useAppSelector(selectIsOnHold);
  const isVisible = !!call && isMinimised;

  const restore = useCallback(() => {
    dispatch(setMinimised(false));
  }, [dispatch]);

  return (
    <View style={{ flex: 1, paddingTop: isVisible ? CALL_BANNER_ROW_HEIGHT : 0 }}>
      {children}
      {isVisible && call ? (
        <CallBanner
          call={call}
          activeSince={activeCall?.activeSince}
          flags={bannerFlags(
            call,
            activeCall?.callSid,
            isJoining && localCallSid === call.callSid,
            isOnHold,
          )}
          onPress={restore}
        />
      ) : null}
    </View>
  );
};
