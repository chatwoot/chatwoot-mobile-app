import { Platform } from 'react-native';

import type { AppDispatch, RootState } from '@/store';
import { VOICE_CALL_PROVIDERS } from '@/constants';
import { callActions } from '@/store/call/callActions';
import { CallService } from '@/store/call/callService';
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
import { isAwaitingTwilioContact } from '@/utils/voiceCallUtils';

import { callEngine } from './callEngine';
import { selectCallerInfo } from './callerInfo';
import {
  cancelJoin,
  isJoinCancelled,
  type JoinResult,
  markLocalEnd,
  pendingJoin,
  trackJoin,
} from './pendingJoins';
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
  type CallKitActionEvent,
  type SystemCall,
  type SystemCallEndReason,
} from '@/services/voice/chatwootCalls';

type Store = {
  dispatch: AppDispatch;
  getState: () => RootState;
  subscribe: (listener: () => void) => () => void;
};

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

const joinNow = (store: Store, callSid: string) => {
  markCallAnswering(callSid);
  const join = trackJoin(
    callSid,
    store.dispatch(callActions.joinCall(callSid)).unwrap() as Promise<JoinResult>,
  );
  join
    .then(result => {
      if (result.status === 'answered_elsewhere' || result.status === 'already_ended') {
        abandonAnswer(callSid);
      }
    })
    .catch(() => abandonAnswer(callSid));
  return join;
};

const startJoin = (store: Store, callSid: string) =>
  pendingJoin(callSid) ?? joinNow(store, callSid);

const endLocally = (store: Store, call: LiveCall | undefined, callSid: string) => {
  const pending = pendingJoin(callSid);
  if (pending) {
    cancelJoin(callSid);
    if (selectLocalCallSid(store.getState()) === callSid) {
      const provider = call?.provider === VOICE_CALL_PROVIDERS.TWILIO ? 'twilio' : 'whatsapp';
      callEngine.hangup(provider).catch(() => {});
    }
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

const declineUnadopted = (event: Extract<CallKitActionEvent, { type: 'end' }>) => {
  if (event.provider === VOICE_CALL_PROVIDERS.WHATSAPP && event.callId) {
    CallService.rejectWhatsappCall(event.callId, event.accountId).catch(() => {});
  } else if (event.inboxId && event.conversationId) {
    CallService.leaveConference({
      inboxId: event.inboxId,
      conversationId: event.conversationId,
      callSid: event.callSid,
      accountId: event.accountId,
    }).catch(() => {});
  }
};

const endUnadopted = (event: Extract<CallKitActionEvent, { type: 'end' }>) => {
  if (event.provider === VOICE_CALL_PROVIDERS.WHATSAPP && event.callId) {
    CallService.terminateWhatsappCall(event.callId, event.accountId).catch(() => {});
  } else if (event.inboxId && event.conversationId) {
    CallService.leaveConference({
      inboxId: event.inboxId,
      conversationId: event.conversationId,
      callSid: event.callSid,
      accountId: event.accountId,
    }).catch(() => {});
  }
};

export const callerInfo = (state: RootState, call: LiveCall) => {
  const info = selectCallerInfo(state, call);
  return {
    ...info,
    handle: info.phone || info.name,
    displayName: info.inboxName ? `${info.name} · ${info.inboxName}` : info.name,
  };
};

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

// Answers wait for pending CallKit reports.
const pendingReports = new Map<string, Promise<void>>();

const carriesMedia = (store: Store, callSid: string) => {
  const state = store.getState();
  return callSid === (selectLocalCallSid(state) ?? selectActiveCall(state)?.callSid);
};

export const systemCall = {
  isAvailable: () => isSystemCallUiAvailable(),

  async reportRinging(store: Store, call: LiveCall) {
    if (!isSystemCallUiAvailable() || call.systemUuid || !call.provider) return;
    if (pendingReports.has(call.callSid)) return pendingReports.get(call.callSid);
    const report = systemCall.reportRingingNow(store, call).finally(() => {
      pendingReports.delete(call.callSid);
    });
    pendingReports.set(call.callSid, report);
    return report;
  },

  async reportRingingNow(store: Store, call: LiveCall) {
    if (!call.provider) return;
    const { displayName, handle } = callerInfo(store.getState(), call);
    try {
      const systemUuid = await reportIncomingSystemCall({
        callSid: call.callSid,
        provider: call.provider,
        displayName,
        handle,
        conversationId: call.conversationId,
        inboxId: call.inboxId,
        accountId: call.accountId,
        callId: call.callId,
      });
      if (__DEV__) console.log('[callkit] reported incoming', systemUuid);
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
        accountId: call.accountId,
        callId: call.callId,
      });
      if (!selectCalls(store.getState()).some(entry => entry.callSid === call.callSid)) {
        endSystemCall(systemUuid, 'remote');
        return;
      }
      store.dispatch(setSystemUuid({ callSid: call.callSid, systemUuid }));
      if (selectIsMuted(store.getState())) {
        requestSystemCallMute(systemUuid, true).catch(() => {});
      }
    } catch (error) {
      console.warn('System call UI could not start the call', error);
    }
  },

  connected(call: LiveCall) {
    if (call.systemUuid) {
      if (!isAwaitingTwilioContact(call)) reportSystemCallConnected(call.systemUuid);
    } else if (Platform.OS === 'ios') {
      if (call.provider === VOICE_CALL_PROVIDERS.WHATSAPP) activateWebrtcAudio();
      else setTwilioAudioEnabled(true);
    }
  },

  contactAnswered(call: LiveCall) {
    if (call.systemUuid) reportSystemCallConnected(call.systemUuid);
  },

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

  // CallKit's answer event starts the join.
  async answer(store: Store, call: LiveCall): Promise<JoinResult> {
    const report = call.systemUuid ? undefined : pendingReports.get(call.callSid);
    if (report) await report;
    const current = report
      ? selectCalls(store.getState()).find(entry => entry.callSid === call.callSid)
      : call;
    if (!current) return { status: 'already_ended' };
    if (current.systemUuid) {
      await requestSystemCallAnswer(current.systemUuid);
      return { status: 'requested' };
    }
    return startJoin(store, current.callSid);
  },

  async end(store: Store, call: LiveCall) {
    markLocalEnd(call.callSid);
    if (call.systemUuid) {
      try {
        await requestSystemCallEnd(call.systemUuid);
        return;
      } catch {
        // Fall back to the local end.
      }
    }
    endLocally(store, call, call.callSid);
  },

  mute(store: Store, call: LiveCall | null, muted: boolean) {
    if (call?.systemUuid) return requestSystemCallMute(call.systemUuid, muted);
    return store.dispatch(callActions.toggleMute()).unwrap();
  },

  adoptPendingCalls(store: Store) {
    const pending = getPendingSystemCalls();
    pending.forEach(system => adoptSystemCall(store, system));
  },

  attach(store: Store, onIncoming?: () => void) {
    if (!isSystemCallUiAvailable()) return () => {};

    const incoming = addIncomingCallListener(system => {
      adoptSystemCall(store, system);
      onIncoming?.();
    });

    const actions = addCallKitActionListener(event => {
      if (__DEV__) console.log('[callkit] action', JSON.stringify(event));
      if (event.type === 'reset') {
        store.dispatch(callActions.endLocalCalls());
        store.dispatch(clearSystemCalls());
        return;
      }
      const call = selectCalls(store.getState()).find(entry => entry.callSid === event.callSid);
      switch (event.type) {
        case 'answer':
          if (call && !call.isActive && !pendingJoin(event.callSid)) {
            // Queued answers remain cancellable while waiting.
            trackJoin(
              event.callSid,
              whenNotJoining(store).then((): Promise<JoinResult> | JoinResult => {
                if (isJoinCancelled(event.callSid)) return { status: 'cancelled' };
                const current = selectCalls(store.getState()).find(
                  entry => entry.callSid === event.callSid,
                );
                if (!current) {
                  endSystemCall(event.uuid, 'answered_elsewhere');
                  return { status: 'already_ended' };
                }
                if (current.isActive) return { status: 'joined' };
                return joinNow(store, event.callSid).then(result => {
                  if (result.status !== 'joined') endSystemCall(event.uuid, 'answered_elsewhere');
                  return result;
                });
              }),
            ).catch(error => {
              reportAnswerFailure(error);
              endSystemCall(event.uuid, 'failed');
            });
          }
          break;
        case 'end':
          if (call || pendingJoin(event.callSid)) {
            endLocally(store, call, event.callSid);
          } else if (!event.answered && !event.outgoing) {
            declineUnadopted(event);
          } else {
            endUnadopted(event);
          }
          break;
        case 'ended':
          if (call && !call.isActive && call.callSid !== selectLocalCallSid(store.getState())) {
            store.dispatch(dismissCall(call.callSid));
          }
          break;
        case 'mute':
          if (!carriesMedia(store, event.callSid)) break;
          callEngine.setMuted(event.muted).catch(() => {});
          store.dispatch(setMuted(event.muted));
          break;
        case 'hold':
          if (!carriesMedia(store, event.callSid)) break;
          store.dispatch(callActions.setHold(event.onHold));
          break;
        default:
          break;
      }
    });

    const audio = addAudioSessionListener(event => {
      if (__DEV__) console.log('[callkit] audio session', JSON.stringify(event));
    });

    // Attach listeners before flushing buffered events.
    callKitReady();

    return () => {
      incoming.remove();
      actions.remove();
      audio.remove();
    };
  },
};

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
        caller: { name: system.callerName ?? system.displayName, phone: system.handle },
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
