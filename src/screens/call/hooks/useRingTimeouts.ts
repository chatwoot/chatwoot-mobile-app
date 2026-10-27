import { useEffect, useRef } from 'react';

import { useAppDispatch, useAppSelector } from '@/hooks';
import { store } from '@/store';
import { selectIncomingCalls, selectLocalCallSid } from '@/store/call/callSelectors';
import { removeCall } from '@/store/call/callSlice';

import { RING_TIMEOUT_MS } from '../constants/ringTimeouts';

// Timeout dismissal does not reject server-side.
export const useRingTimeouts = () => {
  const dispatch = useAppDispatch();
  const incomingCalls = useAppSelector(selectIncomingCalls);
  const localCallSid = useAppSelector(selectLocalCallSid);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  // Answer attempts defer local ring expiry.
  const expiredRef = useRef<Set<string>>(new Set());

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
          if (selectLocalCallSid(store.getState()) === call.callSid) {
            expiredRef.current.add(call.callSid);
            return;
          }
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
    const expired = expiredRef.current;
    expired.forEach(callSid => {
      if (callSid === localCallSid) return;
      expired.delete(callSid);
      const call = incomingCalls.find(entry => entry.callSid === callSid);
      if (call && !call.isActive) dispatch(removeCall(callSid));
    });
  }, [localCallSid, incomingCalls, dispatch]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(timer => clearTimeout(timer));
      timers.clear();
    };
  }, []);
};
