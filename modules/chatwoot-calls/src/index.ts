import { Platform } from 'react-native';
import { isEmulatorSync } from 'react-native-device-info';

import ChatwootCallsModule from './ChatwootCallsModule';
import type {
  AudioRoute,
  AudioRouteEvent,
  AudioSessionEvent,
  CallKitActionEvent,
  NativeCallActionEvent,
  NativeCallState,
  OngoingCallState,
  SystemCall,
  SystemCallEndReason,
  SystemCallReport,
  TwilioCallStateEvent,
  VoipTokenEvent,
} from './ChatwootCalls.types';

export type {
  AudioRoute,
  AudioRouteEvent,
  AudioSessionEvent,
  CallKitActionEvent,
  NativeCallActionEvent,
  NativeCallState,
  OngoingCallState,
  SystemCall,
  SystemCallEndReason,
  SystemCallReport,
  TwilioCallState,
  TwilioCallStateEvent,
  VoipTokenEvent,
} from './ChatwootCalls.types';

const CONNECT_TIMEOUT_MS = 30_000;
const noSubscription = { remove: () => {} };

export const isNativeCallsAvailable = () => ChatwootCallsModule !== null;

// Simulator CallKit ends calls prematurely.
export const isSystemCallUiAvailable = () =>
  Platform.OS === 'ios' && ChatwootCallsModule !== null && !isEmulatorSync();

const systemCallUi = () => (isSystemCallUiAvailable() ? ChatwootCallsModule : null);

export const addTwilioCallStateListener = (listener: (event: TwilioCallStateEvent) => void) =>
  ChatwootCallsModule?.addListener('onTwilioCallState', listener) ?? noSubscription;

export const addCallKitActionListener = (listener: (event: CallKitActionEvent) => void) =>
  systemCallUi()?.addListener('onCallKitAction', listener) ?? noSubscription;

export const addIncomingCallListener = (listener: (event: SystemCall) => void) =>
  systemCallUi()?.addListener('onIncomingCall', listener) ?? noSubscription;

export const addVoipTokenListener = (listener: (event: VoipTokenEvent) => void) =>
  systemCallUi()?.addListener('onVoipToken', listener) ?? noSubscription;

export const addAudioSessionListener = (listener: (event: AudioSessionEvent) => void) =>
  systemCallUi()?.addListener('onAudioSession', listener) ?? noSubscription;

// Local disconnects can omit terminal callbacks.
let settlePendingConnect: ((error?: Error) => void) | null = null;

export const twilioConnect = (token: string, params: Record<string, string>) =>
  new Promise<void>((resolve, reject) => {
    const native = ChatwootCallsModule;
    if (!native) {
      reject(new Error('Native calls module is not available'));
      return;
    }
    const timer = setTimeout(() => {
      finish(new Error('Timed out connecting the call'));
    }, CONNECT_TIMEOUT_MS);
    const subscription = native.addListener('onTwilioCallState', event => {
      if (event.state === 'connected') finish();
      if (event.state === 'failed' || event.state === 'disconnected') {
        finish(new Error(event.error || `Call ${event.state}`));
      }
    });
    let settled = false;
    function finish(error?: Error) {
      if (settled) return;
      settled = true;
      if (settlePendingConnect === finish) settlePendingConnect = null;
      clearTimeout(timer);
      subscription.remove();
      if (error) reject(error);
      else resolve();
    }
    settlePendingConnect = finish;
    native.twilioConnect(token, params).catch(finish);
  });

export const twilioDisconnect = () => {
  settlePendingConnect?.(new Error('Call disconnected'));
  return ChatwootCallsModule?.twilioDisconnect();
};

export const twilioSetMuted = (muted: boolean) => ChatwootCallsModule?.twilioSetMuted(muted);

export const twilioSetHold = (hold: boolean) => ChatwootCallsModule?.twilioSetHold?.(hold);

export const setSpeakerOn = (enabled: boolean) => ChatwootCallsModule?.setSpeakerOn(enabled);

export const startRingback = () => ChatwootCallsModule?.startRingback?.();

export const stopRingback = () => ChatwootCallsModule?.stopRingback?.();

export const takeNativeCallAction = (callSid?: string | null) =>
  ChatwootCallsModule?.takePendingCallAction?.(callSid ?? null) ?? null;

export const cancelNativeCallNotification = (keepRinging: string[] = []) =>
  ChatwootCallsModule?.cancelCallNotification?.(keepRinging);

export const reportNativeCallState = (state: NativeCallState, callSid?: string | null) =>
  ChatwootCallsModule?.reportCallState?.(state, callSid ?? null);

export const startOngoingCallNotification = (
  callSid: string,
  name: string,
  handle: string,
  inboxName: string,
  avatar: string,
  state: OngoingCallState,
) => ChatwootCallsModule?.startOngoingCall?.(callSid, name, handle, inboxName, avatar, state);

// Retain server identifiers across JavaScript reloads.
export const rememberNativeCall = (
  callSid: string,
  details: {
    callId?: number;
    provider?: string;
    conversationId?: number;
    inboxId?: number;
    accountId?: number;
  },
) => {
  const entries: [string, unknown][] = [
    ['id', details.callId],
    ['provider', details.provider],
    ['conversation_id', details.conversationId],
    ['inbox_id', details.inboxId],
    ['account_id', details.accountId],
  ];
  const data = Object.fromEntries(
    entries.filter(([, value]) => value != null).map(([key, value]) => [key, String(value)]),
  );
  ChatwootCallsModule?.rememberCall?.(callSid, data);
};

export const queueNativeEnd = (callSid: string) => ChatwootCallsModule?.queueEnd?.(callSid);

// True delegates state changes to native.
export const holdCallNatively = (callSid: string): boolean =>
  ChatwootCallsModule?.holdCall?.(callSid) ?? false;

export const resumeCallNatively = (callSid: string): boolean =>
  ChatwootCallsModule?.resumeCall?.(callSid) ?? false;

export const markCallAnswering = (callSid: string) =>
  ChatwootCallsModule?.markCallAnswering?.(callSid);

export const abandonAnswer = (callSid: string) => ChatwootCallsModule?.abandonAnswer?.(callSid);

export const endRingingNativeCall = (callSid: string) =>
  ChatwootCallsModule?.endRingingCall?.(callSid);

export const stopOngoingCallNotification = (callSid: string, reason: 'local' | 'remote') =>
  ChatwootCallsModule?.stopOngoingCall?.(callSid, reason);

export const addAudioRouteListener = (listener: (event: AudioRouteEvent) => void) =>
  ChatwootCallsModule?.addListener('onAudioRoute', listener) ?? noSubscription;

export const addTelecomUnavailableListener = (listener: (event: { callSid: string }) => void) =>
  ChatwootCallsModule?.addListener('onTelecomUnavailable', listener) ?? noSubscription;

export const setAudioRoute = (route: AudioRoute) => ChatwootCallsModule?.setAudioRoute?.(route);

export const getAudioRoute = (): {
  current: AudioRoute;
  available: AudioRoute[];
  names?: string[];
} => ChatwootCallsModule?.currentAudioRoute?.() ?? { current: 'unknown', available: [] };

export const addNativeCallActionListener = (listener: (event: NativeCallActionEvent) => void) =>
  ChatwootCallsModule?.addListener('onNativeCallAction', listener) ?? noSubscription;

export const moveAppToBackground = () => ChatwootCallsModule?.moveAppToBackground?.();

export const startAppRinger = () => {
  if (!ChatwootCallsModule?.startAppRinger) return false;
  ChatwootCallsModule.startAppRinger();
  return true;
};

export const stopAppRinger = () => ChatwootCallsModule?.stopAppRinger?.();

export const setRecentsScreenshotEnabled = (enabled: boolean) =>
  ChatwootCallsModule?.setRecentsScreenshotEnabled?.(enabled);

export const LOCK_SCREEN_CALL_COMPONENT = 'ChatwootLockScreenCall';

export const setLockScreenCallSurfaceVisible = (visible: boolean) =>
  ChatwootCallsModule?.setLockScreenCallSurfaceVisible?.(visible);

// Resolves false when unlocking is cancelled.
export const openAppFromLockScreen = async () =>
  (await ChatwootCallsModule?.openAppFromLockScreen?.()) ?? false;

// Telecom owns audio mode and routing.
export const isTelecomAvailable = () =>
  Platform.OS === 'android' && (ChatwootCallsModule?.isTelecomAvailable?.() ?? false);

export const hasNativeAudioRouting = () =>
  Platform.OS === 'android' &&
  (ChatwootCallsModule?.hasNativeAudioRouting?.() ?? isTelecomAvailable());

export const startAppCallAudio = () => ChatwootCallsModule?.startAppCallAudio?.() ?? null;
export const stopAppCallAudio = (token: string) => ChatwootCallsModule?.stopAppCallAudio?.(token);

export const isDeviceLocked = () => ChatwootCallsModule?.isDeviceLocked?.() ?? false;

// Excludes Android's lock-screen call activity.
export const isAppInForeground = () => ChatwootCallsModule?.isAppInForeground?.() ?? true;

export const activateWebrtcAudio = () => ChatwootCallsModule?.activateWebrtcAudio?.();
export const deactivateWebrtcAudio = () => ChatwootCallsModule?.deactivateWebrtcAudio?.();
export const setTwilioAudioEnabled = (enabled: boolean) =>
  ChatwootCallsModule?.twilioSetAudioEnabled?.(enabled);

export const callKitReady = () => systemCallUi()?.callKitReady();

export const getPendingSystemCalls = (): SystemCall[] => systemCallUi()?.getPendingCalls() ?? [];

export const getVoipToken = () => systemCallUi()?.getVoipToken() ?? null;

export const reportIncomingSystemCall = (report: SystemCallReport) =>
  systemCallUi()!.callKitReportIncoming(report);

export const startOutgoingSystemCall = (report: SystemCallReport) =>
  systemCallUi()!.callKitStartOutgoing(report);

export const reportSystemCallConnected = (uuid: string) =>
  systemCallUi()?.callKitReportConnected(uuid);

export const endSystemCall = (uuid: string, reason: SystemCallEndReason) =>
  systemCallUi()?.callKitEndCall(uuid, reason);

export const requestSystemCallAnswer = (uuid: string) =>
  systemCallUi()?.callKitRequestAnswer(uuid) ?? Promise.resolve();

export const requestSystemCallEnd = (uuid: string) =>
  systemCallUi()?.callKitRequestEnd(uuid) ?? Promise.resolve();

export const requestSystemCallMute = (uuid: string, muted: boolean) =>
  systemCallUi()?.callKitRequestMute(uuid, muted) ?? Promise.resolve();

// Persist sign-in state for native pushes.
export const setNativeSignedIn = (signedIn: boolean) =>
  ChatwootCallsModule?.setSignedIn?.(signedIn);
