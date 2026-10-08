export type TwilioCallState =
  | 'connecting'
  | 'ringing'
  | 'connected'
  | 'reconnecting'
  | 'failed'
  | 'disconnected';

export type TwilioCallStateEvent = {
  state: TwilioCallState;
  error?: string;
};

// A call the system call UI knows about
export type SystemCall = {
  uuid: string;
  callSid: string;
  // Numeric call record id, present when the call arrived by push
  callId?: number;
  provider: 'whatsapp' | 'twilio';
  displayName: string;
  handle: string;
  outgoing: boolean;
  answered: boolean;
  conversationId?: number;
  inboxId?: number;
  accountId?: number;
};

export type SystemCallReport = {
  callSid: string;
  provider: 'whatsapp' | 'twilio';
  displayName: string;
  handle: string;
  conversationId?: number;
  inboxId?: number;
  accountId?: number;
};

export type SystemCallEndReason =
  | 'remote'
  | 'unanswered'
  | 'answered_elsewhere'
  | 'declined_elsewhere'
  | 'failed';

export type CallKitActionEvent =
  | { type: 'answer'; uuid: string; callSid: string }
  | {
      type: 'end';
      uuid: string;
      callSid: string;
      answered: boolean;
      outgoing?: boolean;
      provider?: string;
      callId?: number;
      conversationId?: number;
      inboxId?: number;
      accountId?: number;
    }
  | { type: 'ended'; uuid: string; callSid: string }
  | { type: 'start'; uuid: string; callSid: string }
  | { type: 'mute'; uuid: string; callSid: string; muted: boolean }
  | { type: 'hold'; uuid: string; callSid: string; onHold: boolean }
  | { type: 'reset' };

export type AudioSessionEvent = { active: boolean; provider: string };

export type VoipTokenEvent = { token: string | null };

// What the agent pressed on Android's native call screen or call notification; `pending`
// means a stored answer or decline is waiting to be applied, `dismissed` that a ringing
// call's notification was swiped away
export type NativeCallActionEvent =
  | { action: 'mute'; enabled: boolean }
  | { action: 'speaker'; enabled: boolean }
  | { action: 'end'; callSid?: string }
  | { action: 'pending' }
  | { action: 'dismissed'; callSid: string }
  | { action: 'open' }
  | { action: 'hold'; enabled: boolean };

export type NativeCallState = 'connected' | 'ended' | 'failed';

// What the in-progress notification says: a call being placed, or one that is connected
export type OngoingCallState = 'calling' | 'active';

export type AudioRoute = 'earpiece' | 'speaker' | 'bluetooth' | 'wired' | 'unknown';

// The audio route of the call in progress, the routes on offer, and the devices' own
// names in the same order, empty where a route has none
export type AudioRouteEvent = {
  callSid?: string;
  current: AudioRoute;
  available: AudioRoute[];
  names?: string[];
};

export type ChatwootCallsModuleEvents = {
  onTwilioCallState: (event: TwilioCallStateEvent) => void;
  onNativeCallAction: (event: NativeCallActionEvent) => void;
  onAudioRoute: (event: AudioRouteEvent) => void;
  onCallKitAction: (event: CallKitActionEvent) => void;
  onIncomingCall: (event: SystemCall) => void;
  onVoipToken: (event: VoipTokenEvent) => void;
  onAudioSession: (event: AudioSessionEvent) => void;
};
