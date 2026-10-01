import type { VoiceCallProvider } from '@/types';

import type { AudioRoute } from '@/services/voice/chatwootCalls';

export type VoiceCallDirection = 'inbound' | 'outbound';

export type CallerSnapshot = {
  name?: string | null;
  phone?: string | null;
  avatar?: string | null;
};

export type IceServer = {
  urls: string | string[];
  username?: string;
  credential?: string;
};

// One ringing or active call as tracked by the app, keyed by the provider call id
export type LiveCall = {
  callSid: string;
  callId?: number;
  provider?: VoiceCallProvider;
  conversationId?: number;
  inboxId?: number;
  // The account the call belongs to, when it may differ from the one the app is showing
  accountId?: number;
  callDirection: VoiceCallDirection;
  senderId?: number;
  caller?: CallerSnapshot | null;
  sdpOffer?: string;
  iceServers?: IceServer[];
  isActive: boolean;
  addedAt: number;
  // The provider's own last status for a call this device placed
  providerStatus?: string | null;
  // Set when this device joined the call; the in-call timer counts from here
  activeSince?: number;
  // Identifier of the matching system call (CallKit) when the OS call UI is in use
  systemUuid?: string;
  // The OS declined to show this call, so the app's own ring UI stands in
  systemUiFailed?: boolean;
};

export type LiveCallInput = Omit<LiveCall, 'isActive' | 'addedAt'> & {
  isActive?: boolean;
  addedAt?: number;
};

export type CallState = {
  calls: LiveCall[];
  // Provider call ids that must not be re-added by a late ringing message
  dismissedCallSids: string[];
  // Call this device is answering or owns, set before the accept request is sent
  localCallSid: string | null;
  isJoining: boolean;
  isMuted: boolean;
  // The system parked the call, typically for a cellular call; nothing flows until resumed
  isOnHold: boolean;
  // Where the call's audio goes, where it could go, and the devices' names by route
  audioRoute: {
    current: AudioRoute;
    available: AudioRoute[];
    names: Partial<Record<AudioRoute, string>>;
  };
  // The call screen was pushed aside; the app shows the ongoing-call bar instead
  isMinimised: boolean;
  // An outbound call being placed, held until the provider returns its call id
  placingCall: PlacingCall | null;
};

export type PlacingCall = {
  conversationId: number;
  inboxId?: number;
  provider?: VoiceCallProvider;
};

export type VoiceCallIncomingEvent = {
  account_id: number;
  id: number;
  call_id: string;
  provider: VoiceCallProvider;
  conversation_id: number;
  direction: string;
  inbox_id: number;
  sdp_offer?: string;
  ice_servers?: IceServer[];
  recording_enabled?: boolean;
  caller?: CallerSnapshot;
};

export type VoiceCallStatusEvent = {
  account_id: number;
  id: number;
  call_id: string;
  provider: VoiceCallProvider;
  conversation_id?: number;
  sdp_answer?: string;
  status?: string;
};
