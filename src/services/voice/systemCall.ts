import { Platform } from 'react-native';

import type { AppDispatch, RootState } from '@/store';
import { VOICE_CALL_PROVIDERS } from '@/constants';
import { callActions } from '@/store/call/callActions';
import {
  addCall,
  clearSystemCalls,
  dismissCall,
  markSystemUiFailed,
  setMuted,
  setSystemUuid,
} from '@/store/call/callSlice';
import {
  selectActiveCall,
  selectCalls,
  selectIsJoining,
  selectIsMuted,
  selectLocalCallSid,
} from '@/store/call/callSelectors';
import type { LiveCall } from '@/store/call/callTypes';
import { reportAnswerFailure } from '@/utils/voiceCallFeedback';

import { callEngine } from './callEngine';
import { selectCallerInfo } from './callerInfo';
import { markLocalEnd } from './callSessionCore';
import { type JoinResult, pendingJoin, trackJoin } from './pendingJoins';
import {
  activateWebrtcAudio,
  addAudioSessionListener,
  deactivateWebrtcAudio,
  setTwilioAudioEnabled,
  addCallKitActionListener,
  addIncomingCallListener,
  callKitReady,
  endSystemCall,
  getPendingSystemCalls,
  isSystemCallUiAvailable,
  abandonAnswer,
  markCallAnswering,
  reportIncomingSystemCall,
  reportSystemCallConnected,
  requestSystemCallAnswer,
  requestSystemCallEnd,
  requestSystemCallMute,
  startOutgoingSystemCall,
  type SystemCall,
  type SystemCallEndReason,
} from '@/services/voice/chatwootCalls';

// Keeps the OS call UI (CallKit) in step with the call store. User actions taken in the
// system UI arrive as events and drive the store; actions taken in our own sheet are routed
// through the system UI first so both stay consistent and the audio session is managed
// by the OS. Without the native module every function is a no-op.

type Store = {
  dispatch: AppDispatch;
  getState: () => RootState;
  subscribe: (listener: () => void) => () => void;
};

// How the OS call UI should explain a call that ended without this device's action
export const systemEndReason = (
  store: Store,
  callSid: string,
  status?: string | null,
): SystemCallEndReason => {
  if (selectLocalCallSid(store.getState()) === callSid) return 'remote';
  switch (status) {
    case 'rejected':
      return 'declined_elsewhere';
    case 'no-answer':
    case 'no_answer':
      return 'unanswered';
    case 'in-progress':
    case 'in_progress':
    case 'completed':
      return 'answered_elsewhere';
    default:
      return 'remote';
  }
};

const startJoin = (store: Store, callSid: string) => {
  markCallAnswering(callSid);
  const join = trackJoin(
    callSid,
    store.dispatch(callActions.joinCall(callSid)).unwrap() as Promise<JoinResult>,
  );
  // An answer that did not become a call here must not leave the system call ringing
  join
    .then(result => {
      if (result.status === 'answered_elsewhere' || result.status === 'already_ended') {
        abandonAnswer(callSid);
      }
    })
    .catch(() => abandonAnswer(callSid));
  return join;
};

const endLocally = (store: Store, call: LiveCall | undefined, callSid: string) => {
  const pending = pendingJoin(callSid);
  if (pending) {
    pending
      .then(result => {
        if (result.status === 'joined') return store.dispatch(callActions.endCall()).unwrap();
        return store.dispatch(callActions.rejectIncomingCall(callSid)).unwrap();
      })
      .catch(() => store.dispatch(callActions.rejectIncomingCall(callSid)));
    return;
  }
  const active = selectActiveCall(store.getState());
  if (call?.isActive || (!call && active)) {
    store.dispatch(callActions.endCall());
  } else if (call) {
    store.dispatch(callActions.rejectIncomingCall(callSid));
  }
};

// The OS call screen shows one name, so it carries the inbox the call came through:
// an agent answering needs to know which number rang before they pick up.
export const callerInfo = (state: RootState, call: LiveCall) => {
  const info = selectCallerInfo(state, call);
  return {
    ...info,
    handle: info.phone || info.name,
    displayName: info.inboxName ? `${info.name} · ${info.inboxName}` : info.name,
  };
};

// Resolves once no call is joining
export const whenNotJoining = (store: Store) =>
  new Promise<void>(resolve => {
    if (!selectIsJoining(store.getState())) {
      resolve();
      return;
    }
    const unsubscribe = store.subscribe(() => {
      if (selectIsJoining(store.getState())) return;
      unsubscribe();
      resolve();
    });
  });

export const systemCall = {
  isAvailable: () => isSystemCallUiAvailable(),

  // Shows the OS incoming-call UI for a call that arrived over the socket
  async reportRinging(store: Store, call: LiveCall) {
    if (!isSystemCallUiAvailable() || call.systemUuid || !call.provider) return;
    const { displayName, handle } = callerInfo(store.getState(), call);
    try {
      const systemUuid = await reportIncomingSystemCall({
        callSid: call.callSid,
        provider: call.provider,
        displayName,
        handle,
        conversationId: call.conversationId,
        inboxId: call.inboxId,
      });
      if (__DEV__) console.log('[callkit] reported incoming', systemUuid);
      // The call can end, taken by another agent or hung up, while CallKit shows it; its
      // ring is ended here, since the removal found no system call to end
      if (!selectCalls(store.getState()).some(entry => entry.callSid === call.callSid)) {
        endSystemCall(systemUuid, 'answered_elsewhere');
        return;
      }
      store.dispatch(setSystemUuid({ callSid: call.callSid, systemUuid }));
    } catch (error) {
      console.warn('System call UI could not show the call', error);
      store.dispatch(markSystemUiFailed(call.callSid));
    }
  },

  // Whether the OS is presenting the ring for this call, so the app's own ring UI stays out
  // of the way until the call is answered
  ringsInSystemUi(call: LiveCall) {
    return (
      isSystemCallUiAvailable() &&
      call.callDirection === 'inbound' &&
      !call.isActive &&
      !call.systemUiFailed
    );
  },

  async startOutgoing(store: Store, call: LiveCall) {
    if (!isSystemCallUiAvailable() || !call.provider) return;
    const { displayName, handle } = callerInfo(store.getState(), call);
    try {
      const systemUuid = await startOutgoingSystemCall({
        callSid: call.callSid,
        provider: call.provider,
        displayName,
        handle,
        conversationId: call.conversationId,
        inboxId: call.inboxId,
      });
      // The call can end while CallKit starts it; its record is ended here, since the
      // removal found no system call to end
      if (!selectCalls(store.getState()).some(entry => entry.callSid === call.callSid)) {
        endSystemCall(systemUuid, 'remote');
        return;
      }
      store.dispatch(setSystemUuid({ callSid: call.callSid, systemUuid }));
      // A mute made while the call was being placed is shown on the OS call screen too
      if (selectIsMuted(store.getState())) {
        requestSystemCallMute(systemUuid, true).catch(() => {});
      }
    } catch (error) {
      console.warn('System call UI could not start the call', error);
    }
  },

  // A joined call with a system call behind it is marked connected; without one, the
  // call's audio is switched on directly because no OS activation will come
  connected(call: LiveCall) {
    if (call.systemUuid) {
      reportSystemCallConnected(call.systemUuid);
    } else if (Platform.OS === 'ios') {
      if (call.provider === VOICE_CALL_PROVIDERS.WHATSAPP) activateWebrtcAudio();
      else setTwilioAudioEnabled(true);
    }
  },

  // A socket event says the call finished elsewhere; the system call ends with that reason
  endedBySid(store: Store, callSid: string, reason: SystemCallEndReason) {
    const call = selectCalls(store.getState()).find(entry => entry.callSid === callSid);
    if (call?.systemUuid) endSystemCall(call.systemUuid, reason);
  },

  ended(call: LiveCall, reason: SystemCallEndReason) {
    if (call.systemUuid) {
      endSystemCall(call.systemUuid, reason);
    } else if (Platform.OS === 'ios' && call.isActive) {
      if (call.provider === VOICE_CALL_PROVIDERS.WHATSAPP) deactivateWebrtcAudio();
      else setTwilioAudioEnabled(false);
    }
  },

  // Our sheet's buttons: go through the OS so its UI updates and audio is activated,
  // then the matching action event performs the real work
  // The OS taking the answer resolves as 'requested'; the join follows on its action event
  async answer(store: Store, call: LiveCall): Promise<JoinResult> {
    if (call.systemUuid) {
      await requestSystemCallAnswer(call.systemUuid);
      return { status: 'requested' };
    }
    return startJoin(store, call.callSid);
  },

  // The OS may no longer know the call (ended by a cancel push, or a provider reset);
  // the call is then ended locally so the far side still hangs up
  async end(store: Store, call: LiveCall) {
    markLocalEnd(call.callSid);
    if (call.systemUuid) {
      try {
        await requestSystemCallEnd(call.systemUuid);
        return;
      } catch {
        // fall through to the local end
      }
    }
    endLocally(store, call, call.callSid);
  },

  mute(store: Store, call: LiveCall | null, muted: boolean) {
    if (call?.systemUuid) return requestSystemCallMute(call.systemUuid, muted);
    return store.dispatch(callActions.toggleMute()).unwrap();
  },

  // Calls the OS already knows about when JavaScript starts: a push reported them, or the
  // user answered on the lock screen before the app finished launching
  adoptPendingCalls(store: Store) {
    const pending = getPendingSystemCalls();
    pending.forEach(system => adoptSystemCall(store, system));
  },

  // Wires the OS events for the lifetime of the app session. `onIncoming` runs after a
  // push-delivered call is adopted, so the caller can bring the socket back and check
  // whether the call is still ringing.
  attach(store: Store, onIncoming?: () => void) {
    if (!isSystemCallUiAvailable()) return () => {};

    const incoming = addIncomingCallListener(system => {
      adoptSystemCall(store, system);
      onIncoming?.();
    });

    const actions = addCallKitActionListener(event => {
      if (__DEV__) console.log('[callkit] action', JSON.stringify(event));
      if (event.type === 'reset') {
        // CallKit dropped every call it held; the media and the server call end with them,
        // a call still ringing out included. Calls still ringing in lose their system call
        // and ring in the app instead.
        store.dispatch(callActions.endLocalCalls());
        store.dispatch(clearSystemCalls());
        return;
      }
      const call = selectCalls(store.getState()).find(entry => entry.callSid === event.callSid);
      switch (event.type) {
        case 'answer':
          if (call && !call.isActive) {
            // CallKit has already fulfilled the answer, so one made while another call is
            // joining waits for that join and is then joined or ended
            whenNotJoining(store)
              .then(() => {
                const current = selectCalls(store.getState()).find(
                  entry => entry.callSid === event.callSid,
                );
                if (!current) {
                  endSystemCall(event.uuid, 'answered_elsewhere');
                  return undefined;
                }
                if (current.isActive) return undefined;
                return startJoin(store, event.callSid).then(result => {
                  if (result.status !== 'joined') endSystemCall(event.uuid, 'answered_elsewhere');
                });
              })
              .catch(error => {
                // Answered from the OS call screen, so the reason has nowhere else to go
                reportAnswerFailure(error);
                endSystemCall(event.uuid, 'failed');
              });
          }
          break;
        case 'end':
          endLocally(store, call, event.callSid);
          break;
        case 'ended':
          // CallKit ended a ring itself, on a cancel push or its own ring timeout; the app's
          // copy goes with it unless it is the call this device is on
          if (call && !call.isActive && call.callSid !== selectLocalCallSid(store.getState())) {
            store.dispatch(dismissCall(call.callSid));
          }
          break;
        case 'mute':
          callEngine.setMuted(event.muted).catch(() => {});
          store.dispatch(setMuted(event.muted));
          break;
        case 'hold':
          store.dispatch(callActions.setHold(event.onHold));
          break;
        default:
          break;
      }
    });

    // The module switches the media engines' audio when the OS activates the session
    const audio = addAudioSessionListener(event => {
      if (__DEV__) console.log('[callkit] audio session', JSON.stringify(event));
    });

    // The events the OS buffered until now, such as a mute made on the lock screen before
    // the app was up, arrive once the listeners above are in place
    callKitReady();

    return () => {
      incoming.remove();
      actions.remove();
      audio.remove();
    };
  },
};

// Puts a system-reported call into the store and, if the user already answered it on the
// lock screen, joins it straight away
const adoptSystemCall = (store: Store, system: SystemCall) => {
  const known = selectCalls(store.getState()).find(entry => entry.callSid === system.callSid);
  if (!known) {
    store.dispatch(
      addCall({
        callSid: system.callSid,
        callId: system.callId,
        provider: system.provider,
        conversationId: system.conversationId,
        inboxId: system.inboxId,
        accountId: system.accountId,
        callDirection: system.outgoing ? 'outbound' : 'inbound',
        caller: { name: system.displayName, phone: system.handle },
        systemUuid: system.uuid,
      }),
    );
  } else if (!known.systemUuid) {
    store.dispatch(setSystemUuid({ callSid: system.callSid, systemUuid: system.uuid }));
  }
  if (system.answered && !system.outgoing) {
    const current = selectCalls(store.getState()).find(entry => entry.callSid === system.callSid);
    if (current && !current.isActive && selectLocalCallSid(store.getState()) !== system.callSid) {
      startJoin(store, system.callSid).catch(error => {
        reportAnswerFailure(error);
        endSystemCall(system.uuid, 'failed');
      });
    }
  }
};
