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

export type LiveCall = {
  callSid: string;
  callId?: number;
  provider?: VoiceCallProvider;
  conversationId?: number;
  inboxId?: number;
  // Can differ from the selected account.
  accountId?: number;
  callDirection: VoiceCallDirection;
  senderId?: number;
  caller?: CallerSnapshot | null;
  sdpOffer?: string;
  iceServers?: IceServer[];
  isActive: boolean;
  addedAt: number;
  providerStatus?: string | null;
  // Local join time in milliseconds.
  activeSince?: number;
  // Outbound Twilio contact-answer time in milliseconds.
  answeredAt?: number;
  systemUuid?: string;
  systemUiFailed?: boolean;
};

export type LiveCallInput = Omit<LiveCall, 'isActive' | 'addedAt'> & {
  isActive?: boolean;
  addedAt?: number;
};

export type CallState = {
  calls: LiveCall[];
  dismissedCallSids: string[];
  localCallSid: string | null;
  isJoining: boolean;
  joiningCallSid: string | null;
  isMuted: boolean;
  isOnHold: boolean;
  audioRoute: {
    current: AudioRoute;
    available: AudioRoute[];
    names: Partial<Record<AudioRoute, string>>;
  };
  isMinimised: boolean;
  placingCall: PlacingCall | null;
};

export type PlacingCall = {
  // Contact calls resolve their conversation server-side.
  conversationId?: number;
  inboxId?: number;
  provider?: VoiceCallProvider;
  accountId?: number;
  caller?: CallerSnapshot | null;
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
