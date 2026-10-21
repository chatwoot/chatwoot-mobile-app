import { useEffect } from 'react';

import { useAppSelector } from '@/hooks';
import { selectHasActiveCall } from '@/store/call/callSelectors';
import { webrtcEngine } from '@/services/voice/webrtcEngine';
import { isNativeCallsAvailable } from '@/services/voice/chatwootCalls';

const REPORT_INTERVAL_MS = 5_000;

// Development only: notes whether the native module loaded and logs the media path
// every few seconds while a call is active
export const useMediaDebugLog = () => {
  const hasActiveCall = useAppSelector(selectHasActiveCall);

  useEffect(() => {
    if (__DEV__)
      console.log(`[call] native module ${isNativeCallsAvailable() ? 'available' : 'missing'}`);
  }, []);

  useEffect(() => {
    if (!__DEV__ || !hasActiveCall) return undefined;
    const timer = setInterval(() => {
      webrtcEngine
        .connectionReport()
        .then(report => console.log('[call] media', JSON.stringify(report)))
        .catch(() => {});
    }, REPORT_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [hasActiveCall]);
};
