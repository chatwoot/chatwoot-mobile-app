import { store } from '@/store';
import { VOICE_CALL_PROVIDERS } from '@/constants';
import { callActions } from '@/store/call/callActions';
import {
  addCall,
  clearActiveCall,
  clearLocalCall,
  dismissCall,
  markLocalCall,
  setAudioRoute,
  setMinimised,
} from '@/store/call/callSlice';
import {
  selectActiveCall,
  selectCalls,
  selectHasActiveCall,
  selectIncomingCalls,
  selectIsJoining,
  selectIsMuted,
  selectIsSpeakerOn,
  selectLocalCallSid,
} from '@/store/call/callSelectors';
import { callEngine } from '@/services/voice/callEngine';
import { setWebrtcConnectionLostHandler, webrtcEngine } from '@/services/voice/webrtcEngine';
import type { LiveCall } from '@/store/call/callTypes';
import { callerInfo, systemCall } from '@/services/voice/systemCall';
import { takePendingCallAction, type PendingCallAction } from '@/utils/callNotifications';
import { reportAnswerFailure } from '@/utils/voiceCallFeedback';
import {
  addAudioRouteListener,
  getAudioRoute,
  addNativeCallActionListener,
  addTwilioCallStateListener,
  endRingingNativeCall,
  endSystemCall,
  isDeviceLocked,
  isTelecomAvailable,
  moveAppToBackground,
  reportNativeCallState,
  startOngoingCallNotification,
  stopOngoingCallNotification,
  type AudioRoute,
} from '@/services/voice/chatwootCalls';

// The platform reports its routes as a list with a name beside each, empty where a route
// has none
const audioRouteNames = (available: AudioRoute[], names?: string[]) => {
  const byRoute: Partial<Record<AudioRoute, string>> = {};
  available.forEach((route, index) => {
    if (names?.[index]) byRoute[route] = names[index];
  });
  return byRoute;
};

// The part of a call session that needs no React tree: the media engines' end-of-call
// signals, Android's native call screen, and the choice the agent made on it. The app's
// call hook attaches it while mounted, and the Android headless task attaches it for a
// call answered on the lock screen, where no activity exists at all.

let attachments = 0;
let detach: (() => void) | null = null;

// Whether the call being carried was answered outside the app
let openedForCall = false;

// The call this device ended itself, so Telecom records it as a local hang-up
let locallyEndedSid: string | null = null;

export const markLocalEnd = (callSid: string) => {
  locallyEndedSid = callSid;
};

// The end of a call is held back while another one is being taken in its place, so the
// native screen carries over rather than closing between the two
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

// The choices made on the Android call notification or native call screen, oldest first.
// Each is taken once, so concurrent runs share the queue rather than repeat a choice.
export const applyPendingCallAction = async () => {
  for (let pending = takePendingCallAction(); pending; pending = takePendingCallAction()) {
    await applyCallAction(pending);
  }
};

// A call answered before it reached the store is created from what the ring carried, so
// the caller stops ringing as soon as the app can answer
const applyCallAction = async (pending: PendingCallAction) => {
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
  // Taken here: the call screen shows it connecting from the first frame
  if (pending.action === 'answer') store.dispatch(markLocalCall(pending.callSid));
  const call = selectCalls(store.getState()).find(entry => entry.callSid === pending.callSid);
  if (pending.action === 'decline') {
    // The server learns of the decline so the caller and the agent's other devices stop
    // ringing; the request itself is what the headless task waits on
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
    const result = (await systemCall.answer(store, call)) as { status: string } | void;
    if (!result || result.status !== 'joined') reportNativeCallState('failed', pending.callSid);
  } catch (error) {
    // Answered on the native screen, so the reason is told once the app is in front
    reportAnswerFailure(error);
    reportNativeCallState('failed', pending.callSid);
  }
};

const install = () => {
  // The WhatsApp media dropped: the far side hung up or the network gave out. The call
  // ends now rather than waiting for the server's own word on it.
  setWebrtcConnectionLostHandler(() => {
    const state = store.getState();
    const localCallSid = selectLocalCallSid(state);
    const active = selectActiveCall(state);
    if (!active || !localCallSid || active.callSid !== localCallSid) return;
    if (active.provider !== VOICE_CALL_PROVIDERS.WHATSAPP) return;
    // Ended like a hang-up: the server is told and the microphone is released
    store.dispatch(callActions.endCall());
  });

  // A Twilio call can end from the far side or on a network failure
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
    store.dispatch(clearActiveCall());
    store.dispatch(clearLocalCall(active.callSid));
  });

  // Buttons pressed on Android's native call screen
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
        // The screen also stores the end as a decline in case nobody was listening
        if (event.callSid) takePendingCallAction(event.callSid);
        // The end names its call; one without a name falls back to what is on screen
        const named = event.callSid
          ? selectCalls(state).find(entry => entry.callSid === event.callSid)
          : undefined;
        if (event.callSid && !named) break;
        const call = named ?? selectActiveCall(state) ?? selectIncomingCalls(state)[0];
        if (call) systemCall.end(store, call);
        break;
      }
      case 'pending':
        applyPendingCallAction().catch(() => {});
        break;
      case 'dismissed':
        // The ring is dropped here without declining; a call this device is taking stays
        if (event.callSid !== selectLocalCallSid(state)) {
          store.dispatch(dismissCall(event.callSid));
        }
        break;
      case 'open':
        store.dispatch(setMinimised(false));
        break;
      case 'hold':
        store.dispatch(callActions.setHold(event.enabled));
        break;
      default:
        break;
    }
  });

  // The native call screen follows the call's state; the audio route is held for as long
  // as the call is up; a call that took the agent out of the lock screen steps back off it.
  // Android's in-progress notification covers a call from the moment it is placed or
  // answered, so the agent can always get back to it.
  let wasActive = selectHasActiveCall(store.getState());
  let speakerOn = selectIsSpeakerOn(store.getState());
  let carriedSid: string | null = null;
  let carriedActive = false;
  let carriedCall: LiveCall | null = null;
  // The call last reported connected, which an end report refers to
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
  let knownSids = new Set(selectCalls(store.getState()).map(call => call.callSid));
  const unsubscribe = store.subscribe(() => {
    const state = store.getState();
    const previousCarried = carriedSid;
    // Signing out clears the store under a live call; its media and system call end too
    if (!state.auth?.user && carriedCall) {
      const ended = carriedCall;
      callEngine
        .hangup(ended.provider === VOICE_CALL_PROVIDERS.WHATSAPP ? 'whatsapp' : 'twilio')
        .catch(() => {});
      if (ended.systemUuid) endSystemCall(ended.systemUuid, 'remote');
    }
    const active = selectActiveCall(state);
    const isSpeakerOn = selectIsSpeakerOn(state);
    const carried =
      active ?? selectIncomingCalls(state).find(call => call.callDirection === 'outbound') ?? null;
    if (carried && (carried.callSid !== carriedSid || !!carried.isActive !== carriedActive)) {
      const info = callerInfo(state, carried);
      startOngoingCallNotification(
        carried.callSid,
        info.name,
        info.handle === info.name ? '' : info.handle,
        info.inboxName,
        info.avatar,
        carried.isActive ? 'active' : 'calling',
      );
    } else if (!carried && carriedSid) {
      stopOngoingCallNotification(carriedSid, locallyEndedSid === carriedSid ? 'local' : 'remote');
      if (locallyEndedSid === carriedSid) locallyEndedSid = null;
    }
    carriedSid = carried?.callSid ?? null;
    carriedActive = !!carried?.isActive;
    carriedCall = carried;
    // A ring that left the store without being carried here (answered elsewhere, timed
    // out, or a join that failed) is closed with the platform too
    const sids = new Set(selectCalls(state).map(call => call.callSid));
    knownSids.forEach(sid => {
      if (sid && !sids.has(sid) && sid !== previousCarried) endRingingNativeCall(sid);
    });
    knownSids = sids;
    // Where Telecom routes the audio, re-asserting the speaker flag would override a
    // route the agent just chose, so the route is left to Telecom there
    if (active && (!wasActive || isSpeakerOn !== speakerOn) && !isTelecomAvailable()) {
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

  // A headset or the system changed the route, or the routes on offer changed
  const audioRoute = addAudioRouteListener(event => {
    store.dispatch(
      setAudioRoute({
        current: event.current,
        available: event.available,
        names: audioRouteNames(event.available, event.names),
      }),
    );
  });

  return () => {
    setWebrtcConnectionLostHandler(null);
    twilio.remove();
    native.remove();
    audioRoute.remove();
    unsubscribe();
  };
};
