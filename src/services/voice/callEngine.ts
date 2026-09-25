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

// Media layer contract. Screens and thunks only talk to this interface, so the native
// implementation (WebRTC for WhatsApp, Twilio's Voice SDK for Twilio) can land without
// touching the call UI.
export type CallEngine = {
  isAvailable: (provider: VoiceCallProvider) => boolean;
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

// Thunks serialise thrown errors into plain objects, so the check is by name, not class
export const isMediaUnavailableError = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  (error as { name?: string }).name === 'MediaUnavailableError';

const unavailable = (provider: VoiceCallProvider) => async () => {
  throw new MediaUnavailableError(provider);
};

// Which engine currently holds the audio session, so mute and speaker go to the right one
let activeProvider: VoiceCallProvider | null = null;

// WhatsApp media runs on WebRTC in JavaScript; Twilio media runs on Twilio's native Voice
// SDK inside the in-repo ChatwootCalls module.
export const callEngine: CallEngine = {
  isAvailable: provider => (provider === 'whatsapp' ? true : isNativeCallsAvailable()),
  whatsapp: {
    createOffer: async iceServers => {
      activeProvider = 'whatsapp';
      return webrtcEngine.createOffer(iceServers);
    },
    createAnswer: async (sdpOffer, iceServers) => {
      activeProvider = 'whatsapp';
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
      activeProvider = 'twilio';
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
