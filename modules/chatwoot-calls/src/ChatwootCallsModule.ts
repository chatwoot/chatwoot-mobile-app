import { NativeModule, requireOptionalNativeModule } from 'expo';

import {
  AudioRoute,
  ChatwootCallsModuleEvents,
  NativeCallState,
  OngoingCallState,
  SystemCall,
  SystemCallReport,
} from './ChatwootCalls.types';

declare class ChatwootCallsModule extends NativeModule<ChatwootCallsModuleEvents> {
  twilioConnect(token: string, params: Record<string, string>): Promise<void>;
  twilioDisconnect(): void;
  twilioSetMuted(muted: boolean): void;
  twilioSetHold?(hold: boolean): void;
  twilioIsConnected(): boolean;
  setSpeakerOn(enabled: boolean): void;
  takePendingCallAction?(): string | null;
  cancelCallNotification?(): void;
  dismissIncomingCallUi?(): void;
  reportCallState?(state: NativeCallState): void;
  startOngoingCall?(
    callSid: string,
    name: string,
    handle: string,
    inboxName: string,
    avatar: string,
    state: OngoingCallState,
  ): void;
  stopOngoingCall?(callSid: string, reason: string): void;
  endRingingCall?(callSid: string): void;
  markCallAnswering?(callSid: string): void;
  holdCall?(callSid: string): boolean;
  resumeCall?(callSid: string): boolean;
  setLockScreenCallSurfaceVisible?(visible: boolean): void;
  openAppFromLockScreen?(): void;
  moveAppToBackground?(): void;
  isDeviceLocked?(): boolean;
  isTelecomAvailable?(): boolean;
  setAudioRoute?(route: AudioRoute): void;
  currentAudioRoute?(): { current: AudioRoute; available: AudioRoute[]; names?: string[] };
  activateWebrtcAudio(): void;
  deactivateWebrtcAudio(): void;
  callKitReady(): void;
  getPendingCalls(): SystemCall[];
  getVoipToken(): string | null;
  callKitReportIncoming(report: SystemCallReport): Promise<string>;
  callKitStartOutgoing(report: SystemCallReport): Promise<string>;
  callKitReportConnected(uuid: string): void;
  callKitEndCall(uuid: string, reason: string): void;
  callKitRequestAnswer(uuid: string): Promise<void>;
  callKitRequestEnd(uuid: string): Promise<void>;
  callKitRequestMute(uuid: string, muted: boolean): Promise<void>;
}

// Null when the native side is not compiled in (tests, web), so callers can degrade
export default requireOptionalNativeModule<ChatwootCallsModule>('ChatwootCalls');
