import { Platform } from 'react-native';

import type { VoiceCallProvider } from '@/types';
import type { IceServer } from '@/store/call/callTypes';

import { webrtcEngine } from './webrtcEngine';
import {
  isNativeCallsAvailable,
  isTelecomAvailable,
  setAudioRoute as nativeSetAudioRoute,
  setSpeakerOn as nativeSetSpeakerOn,
  twilioSetHold,
  twilioConnect,
  twilioDisconnect,
  twilioSetMuted,
  type AudioRoute,
} from '@/services/voice/chatwootCalls';

// Media layer contract. Screens and thunks only talk to this interface; the media itself
// is WebRTC for WhatsApp and Twilio's Voice SDK for Twilio.
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
  // Ends the media for a call on the engine that carries its provider. With a session
  // number from `session()`, it does nothing if another call's media has started since.
  hangup: (provider: VoiceCallProvider, session?: number) => Promise<void>;
  // Increases each time either engine starts media for a call
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

// The agent has turned the microphone off for the app, so no call can carry audio
export class MicrophoneDeniedError extends Error {
  constructor() {
    super('Microphone permission denied');
    this.name = 'MicrophoneDeniedError';
  }
}

// Thunks serialise thrown errors into plain objects, so the check is by name, not class
const isErrorNamed = (error: unknown, name: string) =>
  typeof error === 'object' && error !== null && (error as { name?: string }).name === name;

export const isMediaUnavailableError = (error: unknown) =>
  isErrorNamed(error, 'MediaUnavailableError');

export const isMicrophoneDeniedError = (error: unknown) =>
  isErrorNamed(error, 'MicrophoneDeniedError');

const unavailable = (provider: VoiceCallProvider) => async () => {
  throw new MediaUnavailableError(provider);
};

// Which engine currently holds the audio session, so mute and speaker go to the right one
let activeProvider: VoiceCallProvider | null = null;
// Counts media starts, so a hangup meant for an earlier call can be recognised
let session = 0;
const beginSession = (provider: VoiceCallProvider) => {
  activeProvider = provider;
  session += 1;
};

// WhatsApp media runs on WebRTC in JavaScript; Twilio media runs on Twilio's native Voice
// SDK inside the in-repo ChatwootCalls module.
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
      return webrtcEngine.hangup();
    },
  },
  twilio: {
    connect: async (token, params) => {
      if (!isNativeCallsAvailable()) return unavailable('twilio')();
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
  // A named route; where the platform cannot pick one, speaker on or off is the fallback
  setAudioRoute: async route => {
    nativeSetAudioRoute(route);
    if (Platform.OS === 'android' && !isTelecomAvailable() && activeProvider !== 'twilio') {
      await webrtcEngine.setSpeaker(route === 'speaker');
    }
  },
};

export const activeMediaProvider = () => activeProvider;
