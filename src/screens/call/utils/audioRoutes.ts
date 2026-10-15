import i18n from '@/i18n';
import type { AudioRoute } from '@/services/voice/chatwootCalls';

export type AudioRouteState = {
  current: AudioRoute;
  available: AudioRoute[];
  names: Partial<Record<AudioRoute, string>>;
};

const ROUTE_ORDER: AudioRoute[] = ['earpiece', 'speaker', 'wired', 'bluetooth'];

const ROUTE_LABEL_KEYS: Record<AudioRoute, string> = {
  earpiece: 'CONVERSATION.VOICE_WIDGET.ROUTE_EARPIECE',
  speaker: 'CONVERSATION.VOICE_WIDGET.ROUTE_SPEAKER',
  bluetooth: 'CONVERSATION.VOICE_WIDGET.ROUTE_BLUETOOTH',
  wired: 'CONVERSATION.VOICE_WIDGET.ROUTE_WIRED',
  unknown: 'CONVERSATION.VOICE_WIDGET.AUDIO_ROUTE',
};

export const isHeadsetRoute = (route: AudioRoute) => route === 'bluetooth' || route === 'wired';

export const hasHeadsetRoute = (state: AudioRouteState) => state.available.some(isHeadsetRoute);

export const availableAudioRoutes = (state: AudioRouteState) =>
  ROUTE_ORDER.filter(route => state.available.includes(route));

// A headset goes by its own name; the phone's routes keep their labels
export const audioRouteLabel = (state: AudioRouteState, route: AudioRoute) =>
  isHeadsetRoute(route) && state.names[route]
    ? (state.names[route] as string)
    : i18n.t(ROUTE_LABEL_KEYS[route]);
