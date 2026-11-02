import { store } from '@/store';
import { VOICE_CALL_PROVIDERS } from '@/constants';
import { callActions } from '@/store/call/callActions';
import { CallService } from '@/store/call/callService';
import {
  addCall,
  clearLocalCall,
  dismissCall,
  markLocalCall,
  removeCall,
  setAudioRoute,
  setMinimised,
} from '@/store/call/callSlice';
import {
  selectActiveCall,
  selectCalls,
  selectFullScreenCall,
  selectHasActiveCall,
  selectIncomingCalls,
  selectIsJoining,
  selectIsMuted,
  selectIsSpeakerOn,
  selectLocalCallSid,
} from '@/store/call/callSelectors';
import { callEngine } from '@/services/voice/callEngine';
import {
  setMicrophoneGrantedHandler,
  setWebrtcConnectionLostHandler,
  webrtcEngine,
} from '@/services/voice/webrtcEngine';
import type { RootState } from '@/store';
import type { LiveCall } from '@/store/call/callTypes';
import { callerInfo, systemCall, whenNotJoining } from '@/services/voice/systemCall';
import {
  closeSession,
  isSessionClosing,
  takeLocalEnd,
  trackActionDrain,
} from '@/services/voice/pendingJoins';
import { takePendingCallAction, type PendingCallAction } from '@/utils/callNotifications';
import { reportAnswerFailure } from '@/utils/voiceCallFeedback';
import {
  addAudioRouteListener,
  addTelecomUnavailableListener,
  queueNativeEnd,
  rememberNativeCall,
  getAudioRoute,
  addNativeCallActionListener,
  addTwilioCallStateListener,
  endRingingNativeCall,
  endSystemCall,
  isDeviceLocked,
  hasNativeAudioRouting,
  moveAppToBackground,
  reportNativeCallState,
  setNativeSignedIn,
  startOngoingCallNotification,
  stopOngoingCallNotification,
  type AudioRoute,
} from '@/services/voice/chatwootCalls';

const audioRouteNames = (available: AudioRoute[], names?: string[]) => {
  const byRoute: Partial<Record<AudioRoute, string>> = {};
  available.forEach((route, index) => {
    if (names?.[index]) byRoute[route] = names[index];
  });
  return byRoute;
};

// UI and headless tasks share ownership.

let attachments = 0;
let detach: (() => void) | null = null;

let openedForCall = false;

// Keep native surfaces during call switches.
let switching = false;
let endReportPending = false;
let settleEndReport: (() => void) | null = null;

export const beginCallSwitch = () => {
  switching = true;
};

export const endCallSwitch = () => {
  switching = false;
  settleEndReport?.();
};

export const attachCallSessionCore = () => {
  attachments += 1;
  if (attachments === 1) detach = install();
  return () => {
    attachments -= 1;
    if (attachments === 0) {
      detach?.();
      detach = null;
    }
  };
};

let draining: Promise<void> = Promise.resolve();
export const applyPendingCallAction = () => {
  const run = draining.then(async () => {
    for (let pending = takePendingCallAction(); pending; pending = takePendingCallAction()) {
      await applyCallAction(pending);
    }
  });
  draining = run.catch(() => {});
  trackActionDrain(run);
  return run;
};

const applyEnd = async (pending: PendingCallAction) => {
  const state = store.getState();
  const active = selectActiveCall(state);
  if (active?.callSid === pending.callSid) {
    await store
      .dispatch(callActions.endCall())
      .unwrap()
      .catch(() => {});
  } else if (pending.provider === VOICE_CALL_PROVIDERS.TWILIO) {
    if (pending.inboxId && pending.conversationId) {
      await CallService.leaveConference({
        inboxId: pending.inboxId,
        conversationId: pending.conversationId,
        callSid: pending.callSid,
        accountId: pending.accountId,
      }).catch(() => {});
    }
  } else if (pending.callId) {
    await CallService.terminateWhatsappCall(pending.callId, pending.accountId).catch(() => {});
  }
  if (active?.callSid !== pending.callSid) stopOngoingCallNotification(pending.callSid, 'local');
  reportNativeCallState('ended', pending.callSid);
};

const applyCallAction = async (pending: PendingCallAction) => {
  if (pending.action === 'end') {
    await applyEnd(pending);
    return;
  }
  const known = selectCalls(store.getState()).some(call => call.callSid === pending.callSid);
  if (!known && pending.callId) {
    store.dispatch(
      addCall({
        callSid: pending.callSid,
        callId: pending.callId,
        provider: pending.provider ?? VOICE_CALL_PROVIDERS.WHATSAPP,
        conversationId: pending.conversationId,
        inboxId: pending.inboxId,
        accountId: pending.accountId,
        caller: pending.caller,
        callDirection: 'inbound',
      }),
    );
  }
  if (pending.action === 'answer') {
    await whenNotJoining(store);
    if (isSessionClosing()) {
      await store
        .dispatch(callActions.rejectIncomingCall(pending.callSid))
        .unwrap()
        .catch(() => {});
      reportNativeCallState('failed', pending.callSid);
      return;
    }
    if (!selectLocalCallSid(store.getState())) store.dispatch(markLocalCall(pending.callSid));
  }
  const call = selectCalls(store.getState()).find(entry => entry.callSid === pending.callSid);
  if (pending.action === 'decline') {
    await store
      .dispatch(callActions.rejectIncomingCall(pending.callSid))
      .unwrap()
      .catch(() => {});
    return;
  }
  if (!call) {
    store.dispatch(clearLocalCall(pending.callSid));
    reportNativeCallState('failed', pending.callSid);
    return;
  }
  openedForCall = true;
  try {
    const { status } = await systemCall.answer(store, call);
    if (status !== 'joined' && status !== 'requested') {
      reportNativeCallState('failed', pending.callSid);
    }
  } catch (error) {
    reportAnswerFailure(error);
    reportNativeCallState('failed', pending.callSid);
    const failed = selectCalls(store.getState()).find(entry => entry.callSid === pending.callSid);
    if (failed && !failed.isActive) store.dispatch(removeCall(pending.callSid));
  }
};

const install = () => {
  setWebrtcConnectionLostHandler(() => {
    const state = store.getState();
    const localCallSid = selectLocalCallSid(state);
    const active = selectActiveCall(state);
    if (!active || !localCallSid || active.callSid !== localCallSid) return;
    if (active.provider !== VOICE_CALL_PROVIDERS.WHATSAPP) return;
    store.dispatch(callActions.endCall());
  });

  const twilio = addTwilioCallStateListener(event => {
    if (event.state !== 'disconnected' && event.state !== 'failed') return;
    const state = store.getState();
    const active = selectActiveCall(state);
    if (
      !active ||
      active.callSid !== selectLocalCallSid(state) ||
      active.provider !== VOICE_CALL_PROVIDERS.TWILIO
    ) {
      return;
    }
    store.dispatch(callActions.endCall());
  });

  const native = addNativeCallActionListener(event => {
    const state = store.getState();
    switch (event.action) {
      case 'mute':
        if (selectIsMuted(state) !== event.enabled) store.dispatch(callActions.toggleMute());
        break;
      case 'speaker':
        if (selectIsSpeakerOn(state) !== event.enabled) {
          store.dispatch(callActions.toggleSpeaker());
        }
        break;
      case 'end': {
        if (event.callSid) takePendingCallAction(event.callSid);
        const named = event.callSid
          ? selectCalls(state).find(entry => entry.callSid === event.callSid)
          : undefined;
        if (event.callSid && !named) {
          queueNativeEnd(event.callSid);
          applyPendingCallAction().catch(() => {});
          break;
        }
        const call = named ?? selectActiveCall(state) ?? selectIncomingCalls(state)[0];
        if (call) systemCall.end(store, call);
        break;
      }
      case 'pending':
        applyPendingCallAction().catch(() => {});
        break;
      case 'dismissed':
        if (event.callSid !== selectLocalCallSid(state)) {
          store.dispatch(dismissCall(event.callSid));
        }
        break;
      case 'open':
        store.dispatch(setMinimised(false));
        break;
      case 'hold':
        if (
          event.callSid &&
          event.callSid !== (selectLocalCallSid(state) ?? selectActiveCall(state)?.callSid)
        ) {
          break;
        }
        store.dispatch(callActions.setHold(event.enabled));
        break;
      default:
        break;
    }
  });

  let wasActive = selectHasActiveCall(store.getState());
  let speakerOn = selectIsSpeakerOn(store.getState());
  let carriedSid: string | null = null;
  let carriedActive = false;
  let carriedCall: LiveCall | null = null;
  let connectedSid: string | null = null;
  const reportEnded = () => {
    endReportPending = false;
    reportNativeCallState('ended', connectedSid);
    connectedSid = null;
    if (openedForCall) {
      openedForCall = false;
      if (isDeviceLocked()) moveAppToBackground();
    }
  };
  settleEndReport = () => {
    const state = store.getState();
    if (endReportPending && !selectActiveCall(state) && !selectIsJoining(state) && !switching) {
      reportEnded();
    }
  };
  const startCarried = (state: RootState, carried: LiveCall) => {
    const info = callerInfo(state, carried);
    startOngoingCallNotification(
      carried.callSid,
      info.name,
      info.handle === info.name ? '' : info.handle,
      info.inboxName,
      info.avatar,
      carried.isActive || carried.callDirection === 'inbound' ? 'active' : 'calling',
    );
  };
  // Retry service startup after microphone permission.
  setMicrophoneGrantedHandler(() => {
    if (carriedCall && !carriedActive) startCarried(store.getState(), carriedCall);
  });
  let knownSids = new Set(selectCalls(store.getState()).map(call => call.callSid));
  let signedIn = !!store.getState().auth?.user;
  setNativeSignedIn(signedIn);
  const releaseAllMedia = () => {
    callEngine.whatsapp.hangup().catch(() => {});
    callEngine.twilio.disconnect().catch(() => {});
  };
  const unsubscribe = store.subscribe(() => {
    const state = store.getState();
    const previousCarried = carriedSid;
    // Update before dispatch re-enters this subscriber.
    const wasSignedIn = signedIn;
    const nowSignedIn = !!state.auth?.user;
    signedIn = nowSignedIn;
    if (wasSignedIn !== nowSignedIn) setNativeSignedIn(nowSignedIn);
    if (wasSignedIn && !nowSignedIn) {
      releaseAllMedia();
      store.dispatch(callActions.cancelPlacingCall());
      closeSession(async () => releaseAllMedia()).catch(() => {});
    }
    if (!state.auth?.user && carriedCall) {
      const ended = carriedCall;
      callEngine
        .hangup(ended.provider === VOICE_CALL_PROVIDERS.WHATSAPP ? 'whatsapp' : 'twilio')
        .catch(() => {});
      if (ended.systemUuid) endSystemCall(ended.systemUuid, 'remote');
    }
    const active = selectActiveCall(state);
    const isSpeakerOn = selectIsSpeakerOn(state);
    const localCallSid = selectLocalCallSid(state);
    const incoming = selectIncomingCalls(state);
    const carried =
      active ??
      incoming.find(call => call.callSid === localCallSid) ??
      incoming.find(call => call.callDirection === 'outbound') ??
      null;
    if (carried && (carried.callSid !== carriedSid || !!carried.isActive !== carriedActive)) {
      rememberNativeCall(carried.callSid, {
        callId: carried.callId,
        provider: carried.provider,
        conversationId: carried.conversationId,
        inboxId: carried.inboxId,
        accountId: carried.accountId,
      });
      startCarried(state, carried);
    } else if (!carried && carriedSid) {
      stopOngoingCallNotification(carriedSid, takeLocalEnd(carriedSid) ? 'local' : 'remote');
    }
    carriedSid = carried?.callSid ?? null;
    carriedActive = !!carried?.isActive;
    carriedCall = carried;
    const sids = new Set(selectCalls(state).map(call => call.callSid));
    knownSids.forEach(sid => {
      if (sid && !sids.has(sid) && sid !== previousCarried) endRingingNativeCall(sid);
    });
    knownSids = sids;
    if (active && (!wasActive || isSpeakerOn !== speakerOn) && !hasNativeAudioRouting()) {
      if (active.provider === VOICE_CALL_PROVIDERS.WHATSAPP) {
        webrtcEngine.ensureAudioRoute(isSpeakerOn);
      }
    }
    speakerOn = isSpeakerOn;
    if (active && !wasActive) {
      wasActive = true;
      endReportPending = false;
      switching = false;
      connectedSid = active.callSid;
      reportNativeCallState('connected', active.callSid);
      const route = getAudioRoute();
      if (route.available.length) {
        store.dispatch(
          setAudioRoute({
            current: route.current,
            available: route.available,
            names: audioRouteNames(route.available, route.names),
          }),
        );
      }
    } else if (!active && wasActive) {
      wasActive = false;
      if (selectIsJoining(state) || switching) endReportPending = true;
      else reportEnded();
    } else if (!active && endReportPending) {
      settleEndReport?.();
    }
  });

  const audioRoute = addAudioRouteListener(event => {
    const state = store.getState();
    const callSid = selectLocalCallSid(state) ?? selectFullScreenCall(state)?.callSid;
    if (event.callSid && event.callSid !== callSid) return;
    store.dispatch(
      setAudioRoute({
        current: event.current,
        available: event.available,
        names: audioRouteNames(event.available, event.names),
      }),
    );
  });

  const telecomUnavailable = addTelecomUnavailableListener(event => {
    const state = store.getState();
    const active = selectActiveCall(state);
    if (active?.provider !== VOICE_CALL_PROVIDERS.WHATSAPP) return;
    if (active.callSid !== selectLocalCallSid(state)) return;
    if (event.callSid !== active.callSid) return;
    webrtcEngine.ensureAudioRoute(selectIsSpeakerOn(state));
  });

  return () => {
    setWebrtcConnectionLostHandler(null);
    setMicrophoneGrantedHandler(null);
    twilio.remove();
    native.remove();
    audioRoute.remove();
    telecomUnavailable.remove();
    unsubscribe();
  };
};
