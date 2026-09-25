import React from 'react';

import { EarpieceGlyph, EarpieceOutlineGlyph, HeadsetGlyph, SpeakerGlyph } from '@/svg-icons';
import type { AudioRoute } from '@/services/voice/chatwootCalls';

import { isHeadsetRoute } from '../utils/audioRoutes';

type Props = { route: AudioRoute; color: string };

// Any headset, Bluetooth or wired, shows as the headset glyph
export const AudioRouteIcon = ({ route, color }: Props) => {
  if (isHeadsetRoute(route)) return <HeadsetGlyph color={color} />;
  if (route === 'speaker') return <SpeakerGlyph color={color} />;
  return <EarpieceGlyph color={color} />;
};

// The list shows the phone itself as an outline, the way the system's own picker does
export const AudioRouteListIcon = ({ route, color }: Props) => {
  if (route === 'earpiece') return <EarpieceOutlineGlyph color={color} />;
  return <AudioRouteIcon route={route} color={color} />;
};
