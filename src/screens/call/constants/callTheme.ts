import { Platform } from 'react-native';

// The call screen's palette. Each phase of a call has a tint that washes the backdrop,
// colours the status line and tints the avatar when there is no photo.
export type CallTone = 'ringing' | 'live' | 'held';

export const CALL_SCREEN_BACKGROUND = '#F4F4F6';
export const CALL_INK = 'hsl(0, 0%, 12.5%)';
export const CALL_MUTED_TEXT = 'hsl(0, 0%, 45%)';
export const CALL_LABEL_TEXT = 'hsl(0, 0%, 40%)';
export const CALL_GLYPH_OFF = 'hsl(0, 0%, 39.3%)';
export const CALL_LINK = 'hsl(208, 93.5%, 47.4%)';
export const CALL_END = 'hsl(348, 75%, 58.5%)';
export const CALL_LIVE = 'hsl(151, 55%, 41.5%)';
export const CALL_HOLD = 'hsl(24, 94%, 50%)';
export const CALL_RING = 'hsl(208, 93%, 47%)';

type ToneColours = {
  wash: string;
  status: string;
  avatarFrom: string;
  avatarTo: string;
  avatarInk: string;
  sonar: string;
};

export const CALL_TONES: Record<CallTone, ToneColours> = {
  ringing: {
    wash: CALL_RING,
    status: 'hsl(208, 93.5%, 40%)',
    avatarFrom: 'hsl(208, 60%, 88%)',
    avatarTo: 'hsl(208, 50%, 72%)',
    avatarInk: 'hsl(208, 60%, 28%)',
    sonar: 'hsla(208, 93%, 47%, 0.18)',
  },
  live: {
    wash: CALL_LIVE,
    status: 'hsl(151, 55%, 30%)',
    avatarFrom: 'hsl(151, 40%, 88%)',
    avatarTo: 'hsl(151, 35%, 72%)',
    avatarInk: 'hsl(151, 45%, 22%)',
    sonar: 'hsla(151, 55%, 41.5%, 0.18)',
  },
  held: {
    wash: CALL_HOLD,
    status: 'hsl(24, 94%, 40%)',
    avatarFrom: 'hsl(24, 70%, 90%)',
    avatarTo: 'hsl(24, 60%, 76%)',
    avatarInk: 'hsl(24, 70%, 28%)',
    sonar: 'hsla(24, 94%, 50%, 0.18)',
  },
};

// A raised white surface: the solid look the glass falls back to
export const solidSurface = (radius: number, elevation: 'card' | 'pill') => ({
  backgroundColor: '#FFFFFF',
  borderRadius: radius,
  ...(Platform.OS === 'android'
    ? { elevation: elevation === 'card' ? 6 : 2 }
    : {
        shadowColor: '#000',
        shadowOpacity: elevation === 'card' ? 0.08 : 0.06,
        shadowRadius: elevation === 'card' ? 14 : 4,
        shadowOffset: { width: 0, height: elevation === 'card' ? 8 : 2 },
      }),
});

export const SOLID_CONTROL_OFF = 'hsl(0, 0%, 92%)';
// A control that does nothing yet loses its tile and fades, rather than dimming as a whole
export const CALL_GLYPH_INACTIVE = 'hsl(0, 0%, 76%)';
export const CALL_LABEL_INACTIVE = 'hsl(0, 0%, 68%)';
