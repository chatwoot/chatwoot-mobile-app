import React, { useCallback } from 'react';
import { View } from 'react-native';

import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  selectActiveCall,
  selectFullScreenCall,
  selectIsCallMinimised,
} from '@/store/call/callSelectors';
import { setMinimised } from '@/store/call/callSlice';
import { isOutboundCallRinging } from '@/utils/voiceCallUtils';

import { CALL_BANNER_ROW_HEIGHT, CallBanner } from './components/CallBanner';
import { useCallDuration } from './hooks/useCallDuration';

// Wraps the whole app so the ongoing-call bar has room of its own: the screens move down
// by the bar's row and their safe-area padding sits under the bar's status-bar half.
export const OngoingCallBar = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const call = useAppSelector(selectFullScreenCall);
  const activeCall = useAppSelector(selectActiveCall);
  const isMinimised = useAppSelector(selectIsCallMinimised);
  const duration = useCallDuration(activeCall?.activeSince);
  const isVisible = !!call && isMinimised;

  const restore = useCallback(() => {
    dispatch(setMinimised(false));
  }, [dispatch]);

  return (
    <View style={{ flex: 1, paddingTop: isVisible ? CALL_BANNER_ROW_HEIGHT : 0 }}>
      {children}
      {isVisible ? (
        <CallBanner
          duration={duration}
          isConnected={!!activeCall}
          isRinging={!!call && isOutboundCallRinging(call)}
          onPress={restore}
        />
      ) : null}
    </View>
  );
};
