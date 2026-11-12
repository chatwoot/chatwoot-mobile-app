import { useEffect, useRef } from 'react';

import { useAppSelector } from '@/hooks';
import { store } from '@/store';
import { selectCalls, selectLocalCallSid } from '@/store/call/callSelectors';
import type { LiveCall } from '@/store/call/callTypes';
import { systemCall } from '@/services/voice/systemCall';
import actionCableConnector from '@/utils/actionCable';

export const useSystemCallBridge = (syncRinging: () => void) => {
  const calls = useAppSelector(selectCalls);
  const reportedRef = useRef<Set<string>>(new Set());
  const knownRef = useRef<Map<string, LiveCall>>(new Map());

  useEffect(() => {
    systemCall.adoptPendingCalls(store);
    return systemCall.attach(store, () => {
      actionCableConnector.ensureConnected();
      syncRinging();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Audio still activates without system UI.
  useEffect(() => {
    const reported = reportedRef.current;
    const known = knownRef.current;
    const present = new Set(calls.map(call => call.callSid));
    const localCallSid = selectLocalCallSid(store.getState());

    calls.forEach(call => {
      const previous = known.get(call.callSid);
      if (!call.systemUuid && !reported.has(call.callSid)) {
        reported.add(call.callSid);
        if (call.callDirection === 'inbound') {
          if (!call.isActive && call.callSid !== localCallSid)
            systemCall.reportRinging(store, call);
        } else {
          systemCall.startOutgoing(store, call);
        }
      }
      const becameActive = call.isActive && !previous?.isActive;
      const gainedSystemCall = call.isActive && call.systemUuid && !previous?.systemUuid;
      if (becameActive || gainedSystemCall) systemCall.connected(call);
      else if (call.isActive && call.answeredAt && !previous?.answeredAt) {
        systemCall.contactAnswered(call);
      }
      known.set(call.callSid, call);
    });

    known.forEach((call, callSid) => {
      if (present.has(callSid)) return;
      known.delete(callSid);
      reported.delete(callSid);
      systemCall.ended(call, 'remote');
    });
  }, [calls]);
};
