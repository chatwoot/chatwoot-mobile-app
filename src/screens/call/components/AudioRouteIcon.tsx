import React from 'react';

import { EarpieceGlyph, HeadsetGlyph, SpeakerGlyph } from '@/svg-icons';
import type { AudioRoute } from '@/services/voice/chatwootCalls';

import { isHeadsetRoute } from '../utils/audioRoutes';

type Props = { route: AudioRoute; color: string; size?: number };

// Any headset, Bluetooth or wired, shows as the headset glyph
export const AudioRouteIcon = ({ route, color, size }: Props) => {
  if (isHeadsetRoute(route)) return <HeadsetGlyph color={color} size={size} />;
  if (route === 'speaker') return <SpeakerGlyph color={color} size={size} />;
  return <EarpieceGlyph color={color} size={size} />;
};
