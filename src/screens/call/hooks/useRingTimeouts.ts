import { useEffect, useRef } from 'react';

import { useAppDispatch, useAppSelector } from '@/hooks';
import { store } from '@/store';
import { selectIncomingCalls, selectLocalCallSid } from '@/store/call/callSelectors';
import { removeCall } from '@/store/call/callSlice';

import { RING_TIMEOUT_MS } from '../constants/ringTimeouts';

// Dismisses each inbound ring locally once its provider's ring window has passed; the call
// is not rejected for everyone. A call this device placed ends with the server's word on
// it, and a call being answered here is left to the answer. The dismissal is not
// remembered, so a server that still reports the call ringing can bring it back.
export const useRingTimeouts = () => {
  const dispatch = useAppDispatch();
  const incomingCalls = useAppSelector(selectIncomingCalls);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const timers = timersRef.current;
    const inbound = incomingCalls.filter(call => call.callDirection === 'inbound');
    const liveSids = new Set(inbound.map(call => call.callSid));

    inbound.forEach(call => {
      if (timers.has(call.callSid)) return;
      const remaining = Math.max(0, call.addedAt + RING_TIMEOUT_MS - Date.now());
      timers.set(
        call.callSid,
        setTimeout(() => {
          timers.delete(call.callSid);
          if (selectLocalCallSid(store.getState()) === call.callSid) return;
          dispatch(removeCall(call.callSid));
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
