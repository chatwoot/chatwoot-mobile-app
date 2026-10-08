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

// The system call UI is CallKit, so it exists on iOS only. The simulator has CallKit but no call service behind it and ends every reported call
// within seconds, so it always uses the app's own ring UI.
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

// Resolves once the call is connected; rejects on failure, disconnect before connect,
// or timeout. State events keep flowing to listeners for the rest of the call.
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
    function finish(error?: Error) {
      clearTimeout(timer);
      subscription.remove();
      if (error) reject(error);
      else resolve();
    }
    native.twilioConnect(token, params).catch(finish);
  });

export const twilioDisconnect = () => ChatwootCallsModule?.twilioDisconnect();

export const twilioSetMuted = (muted: boolean) => ChatwootCallsModule?.twilioSetMuted(muted);

export const twilioSetHold = (hold: boolean) => ChatwootCallsModule?.twilioSetHold?.(hold);

export const setSpeakerOn = (enabled: boolean) => ChatwootCallsModule?.setSpeakerOn(enabled);

// Android's call notification is posted natively, so its buttons are read back the same way
// The oldest choice waiting, or the one for the named call
export const takeNativeCallAction = (callSid?: string | null) =>
  ChatwootCallsModule?.takePendingCallAction?.(callSid ?? null) ?? null;

export const cancelNativeCallNotification = () => ChatwootCallsModule?.cancelCallNotification?.();

// Android's native call screen: it shows the state of the call the app carries, and the
// buttons pressed on it arrive as actions
export const reportNativeCallState = (state: NativeCallState, callSid?: string | null) =>
  ChatwootCallsModule?.reportCallState?.(state, callSid ?? null);

// Android's persistent notification for a call in progress
export const startOngoingCallNotification = (
  callSid: string,
  name: string,
  handle: string,
  inboxName: string,
  avatar: string,
  state: OngoingCallState,
) => ChatwootCallsModule?.startOngoingCall?.(callSid, name, handle, inboxName, avatar, state);

// Hold and resume through the platform's call service. True means the platform owns the
// change and reports it back through the hold action; false means it is not tracking the call
export const holdCallNatively = (callSid: string): boolean =>
  ChatwootCallsModule?.holdCall?.(callSid) ?? false;

export const resumeCallNatively = (callSid: string): boolean =>
  ChatwootCallsModule?.resumeCall?.(callSid) ?? false;

// The app is about to join this ring, so a cancel push crossing the answer must not end
// the platform's record of it
export const markCallAnswering = (callSid: string) =>
  ChatwootCallsModule?.markCallAnswering?.(callSid);

// Android: the answer did not go through, so Telecom stops treating the call as ringing
export const abandonAnswer = (callSid: string) => ChatwootCallsModule?.abandonAnswer?.(callSid);

// Closes the platform's record of a ring that never became a call here
export const endRingingNativeCall = (callSid: string) =>
  ChatwootCallsModule?.endRingingCall?.(callSid);

export const stopOngoingCallNotification = (callSid: string, reason: 'local' | 'remote') =>
  ChatwootCallsModule?.stopOngoingCall?.(callSid, reason);

// The audio route of the call in progress: Telecom's on Android, the audio session's on iOS
export const addAudioRouteListener = (listener: (event: AudioRouteEvent) => void) =>
  ChatwootCallsModule?.addListener('onAudioRoute', listener) ?? noSubscription;

export const setAudioRoute = (route: AudioRoute) => ChatwootCallsModule?.setAudioRoute?.(route);

export const getAudioRoute = (): {
  current: AudioRoute;
  available: AudioRoute[];
  names?: string[];
} => ChatwootCallsModule?.currentAudioRoute?.() ?? { current: 'unknown', available: [] };

export const addNativeCallActionListener = (listener: (event: NativeCallActionEvent) => void) =>
  ChatwootCallsModule?.addListener('onNativeCallAction', listener) ?? noSubscription;

export const moveAppToBackground = () => ChatwootCallsModule?.moveAppToBackground?.();

// Android: the phone's ringtone and vibration, played natively. Returns false where the
// module cannot ring, so the caller can fall back to its own player.
export const startAppRinger = () => {
  if (!ChatwootCallsModule?.startAppRinger) return false;
  ChatwootCallsModule.startAppRinger();
  return true;
};

export const stopAppRinger = () => ChatwootCallsModule?.stopAppRinger?.();

// Whether Android keeps a picture of the app's last frame to show when it is reopened.
// Android only; a no-op elsewhere.
export const setRecentsScreenshotEnabled = (enabled: boolean) =>
  ChatwootCallsModule?.setRecentsScreenshotEnabled?.(enabled);

// The React component Android's lock-screen call activity renders for a live call
export const LOCK_SCREEN_CALL_COMPONENT = 'ChatwootLockScreenCall';

// Whether that component has something to show; the native screen stays in front until it does
export const setLockScreenCallSurfaceVisible = (visible: boolean) =>
  ChatwootCallsModule?.setLockScreenCallSurfaceVisible?.(visible);

// Leaves the lock-screen call for the app, which the phone asks to unlock first; true once
// the app has been opened, false when the unlock was cancelled
export const openAppFromLockScreen = async () =>
  (await ChatwootCallsModule?.openAppFromLockScreen?.()) ?? false;

// Android's Telecom framework tracks calls on this device: it sets the audio mode, holds
// focus and routes audio, so the app must not fight it for the route
export const isTelecomAvailable = () =>
  Platform.OS === 'android' && (ChatwootCallsModule?.isTelecomAvailable?.() ?? false);

// True while the phone is locked, so the call screen can hide anything that leads into
// the app. Always false where the app cannot appear over a lock screen at all.
export const isDeviceLocked = () => ChatwootCallsModule?.isDeviceLocked?.() ?? false;

// Whether one of the app's own screens is in front, not counting Android's lock-screen
// call screen; platforms without that screen answer true
export const isAppInForeground = () => ChatwootCallsModule?.isAppInForeground?.() ?? true;

// WebRTC audio for a call with no system call behind it; with a system call the OS
// activates the session and the module switches audio on itself
export const activateWebrtcAudio = () => ChatwootCallsModule?.activateWebrtcAudio?.();
export const deactivateWebrtcAudio = () => ChatwootCallsModule?.deactivateWebrtcAudio?.();
export const setTwilioAudioEnabled = (enabled: boolean) =>
  ChatwootCallsModule?.twilioSetAudioEnabled?.(enabled);

// System call UI (CallKit). The Android half of the module has none of these functions,
// so every one of them is a no-op wherever the system call UI is unavailable.

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
