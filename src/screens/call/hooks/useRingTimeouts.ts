import { useEffect, useRef } from 'react';

import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectIncomingCalls } from '@/store/call/callSelectors';
import { dismissCall, markCallDismissed } from '@/store/call/callSlice';

import { ringTimeoutFor } from '../constants/ringTimeouts';

// Dismisses each ringing call locally once its provider's ring window has passed; the
// call is not rejected for everyone
export const useRingTimeouts = () => {
  const dispatch = useAppDispatch();
  const incomingCalls = useAppSelector(selectIncomingCalls);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const timers = timersRef.current;
    const liveSids = new Set(incomingCalls.map(call => call.callSid));

    incomingCalls.forEach(call => {
      if (timers.has(call.callSid)) return;
      const remaining = Math.max(0, call.addedAt + ringTimeoutFor(call.provider) - Date.now());
      timers.set(
        call.callSid,
        setTimeout(() => {
          timers.delete(call.callSid);
          dispatch(markCallDismissed(call.callSid));
          dispatch(dismissCall(call.callSid));
        }, remaining),
      );
    });

    timers.forEach((timer, callSid) => {
      if (!liveSids.has(callSid)) {
        clearTimeout(timer);
        timers.delete(callSid);
      }
    });
  }, [incomingCalls, dispatch]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(timer => clearTimeout(timer));
      timers.clear();
    };
  }, []);
};
