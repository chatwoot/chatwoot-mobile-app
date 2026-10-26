import { Platform } from 'react-native';

import type { VoiceCallProvider } from '@/types';
import type { IceServer } from '@/store/call/callTypes';

import { ensureMicrophonePermission, webrtcEngine } from './webrtcEngine';
import {
  isNativeCallsAvailable,
  hasNativeAudioRouting,
  setAudioRoute as nativeSetAudioRoute,
  setSpeakerOn as nativeSetSpeakerOn,
  stopRingback,
  twilioSetHold,
  twilioConnect,
  twilioDisconnect,
  twilioSetMuted,
  type AudioRoute,
} from '@/services/voice/chatwootCalls';

export type CallEngine = {
  whatsapp: {
    createOffer: (iceServers?: IceServer[]) => Promise<string>;
    createAnswer: (sdpOffer: string, iceServers?: IceServer[]) => Promise<string>;
    applyAnswer: (sdpAnswer: string) => Promise<void>;
    hangup: () => Promise<void>;
  };
  twilio: {
    connect: (token: string, params: Record<string, string>) => Promise<void>;
    disconnect: () => Promise<void>;
  };
  // Ignore hangups from superseded sessions.
  hangup: (provider: VoiceCallProvider, session?: number) => Promise<void>;
  session: () => number;
  setMuted: (muted: boolean) => Promise<void>;
  setSpeaker: (enabled: boolean) => Promise<void>;
  setHold: (hold: boolean) => Promise<void>;
  setAudioRoute: (route: AudioRoute) => Promise<void>;
};

export class MediaUnavailableError extends Error {
  constructor(provider: VoiceCallProvider) {
    super(`No media engine for ${provider}`);
    this.name = 'MediaUnavailableError';
  }
}

export class MicrophoneDeniedError extends Error {
  constructor() {
    super('Microphone permission denied');
    this.name = 'MicrophoneDeniedError';
  }
}

// Thunks serialize errors without class identity.
const isErrorNamed = (error: unknown, name: string) =>
  typeof error === 'object' && error !== null && (error as { name?: string }).name === name;

export const isMediaUnavailableError = (error: unknown) =>
  isErrorNamed(error, 'MediaUnavailableError');

export const isMicrophoneDeniedError = (error: unknown) =>
  isErrorNamed(error, 'MicrophoneDeniedError');

const unavailable = (provider: VoiceCallProvider) => async () => {
  throw new MediaUnavailableError(provider);
};

let activeProvider: VoiceCallProvider | null = null;
let session = 0;
// Disconnects invalidate connects awaiting microphone permission.
let twilioStarts = 0;

export class ConnectAbandonedError extends Error {
  constructor() {
    super('The call ended while it was connecting');
    this.name = 'ConnectAbandonedError';
  }
}
const beginSession = (provider: VoiceCallProvider) => {
  activeProvider = provider;
  session += 1;
};

export const callEngine: CallEngine = {
  whatsapp: {
    createOffer: async iceServers => {
      beginSession('whatsapp');
      return webrtcEngine.createOffer(iceServers);
    },
    createAnswer: async (sdpOffer, iceServers) => {
      beginSession('whatsapp');
      return webrtcEngine.createAnswer(sdpOffer, iceServers);
    },
    applyAnswer: sdpAnswer => webrtcEngine.applyAnswer(sdpAnswer),
    hangup: async () => {
      if (activeProvider === 'whatsapp') activeProvider = null;
      // Stop ringback before awaiting server requests.
      stopRingback();
      return webrtcEngine.hangup();
    },
  },
  twilio: {
    connect: async (token, params) => {
      if (!isNativeCallsAvailable()) return unavailable('twilio')();
      const attempt = ++twilioStarts;
      // Account switches can bypass launch prompts.
      await ensureMicrophonePermission();
      if (attempt !== twilioStarts) throw new ConnectAbandonedError();
      beginSession('twilio');
      webrtcEngine.abandonOpening();
      try {
        await twilioConnect(token, params);
      } catch (error) {
        activeProvider = null;
        throw error;
      }
    },
    disconnect: async () => {
      twilioStarts += 1;
      if (activeProvider === 'twilio') activeProvider = null;
      twilioDisconnect();
    },
  },
  hangup: async (provider, since) => {
    if (since !== undefined && since !== session) return;
    await (provider === 'twilio' ? callEngine.twilio.disconnect() : callEngine.whatsapp.hangup());
  },
  session: () => session,
  setMuted: async muted => {
    if (activeProvider === 'twilio') twilioSetMuted(muted);
    else await webrtcEngine.setMuted(muted);
  },
  setHold: async hold => {
    if (activeProvider === 'twilio') twilioSetHold(hold);
    else await webrtcEngine.setHold(hold);
  },
  setSpeaker: async enabled => {
    if (activeProvider === 'twilio') nativeSetSpeakerOn(enabled);
    else await webrtcEngine.setSpeaker(enabled);
  },
  setAudioRoute: async route => {
    nativeSetAudioRoute(route);
    if (Platform.OS === 'android' && !hasNativeAudioRouting() && activeProvider !== 'twilio') {
      await webrtcEngine.setSpeaker(route === 'speaker');
    }
  },
};

export const activeMediaProvider = () => activeProvider;
