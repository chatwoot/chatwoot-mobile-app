import { Platform } from 'react-native';

import { tailwind } from '@/theme';

export type CallTone = 'ringing' | 'live' | 'held';

export const CALL_INK = tailwind.color('text-gray-950') as string;
export const CALL_MUTED_TEXT = 'hsl(0, 0%, 45%)';
export const CALL_LABEL_TEXT = 'hsl(0, 0%, 40%)';
export const CALL_LINK = tailwind.color('text-blue-800') as string;
export const CALL_LINK_SOFT = 'hsla(208, 93.5%, 47.4%, 0.1)';
export const CALL_RING_TEXT = 'hsl(208, 93.5%, 40%)';
export const CALL_DIVIDER = 'hsl(240, 5%, 93%)';

export const CALL_END = '#e54666';
export const CALL_ANSWER = '#12a594';

export const CONTROL_OFF_FILL = 'hsl(240, 5%, 95%)';
export const CONTROL_OFF_GLYPH = tailwind.color('text-gray-900') as string;
export const CONTROL_ON_FILL = '#d5efff';
export const CONTROL_ON_GLYPH = CALL_LINK;
export const CONTROL_HOLD_FILL = '#ffee9c';
export const CONTROL_HOLD_GLYPH = '#ab6400';
export const CONTROL_DISABLED_BORDER = 'hsl(240, 5%, 88%)';
export const CONTROL_DISABLED_GLYPH = 'hsl(240, 4%, 72%)';
export const CONTROL_DISABLED_LABEL = 'hsl(0, 0%, 68%)';

type ToneColours = {
  wash: string;
  washTop: number;
  washLow: number;
  status: string;
  avatarFill: string;
  avatarInk: string;
  sonar: string;
};

export const CALL_TONES: Record<CallTone, ToneColours> = {
  ringing: {
    wash: 'hsl(208, 93%, 47%)',
    washTop: 0.26,
    washLow: 0.14,
    status: CALL_RING_TEXT,
    avatarFill: '#d5efff',
    avatarInk: '#0d74ce',
    sonar: 'hsla(208, 93%, 47%, 0.18)',
  },
  live: {
    wash: 'rgb(18, 165, 148)',
    washTop: 0.22,
    washLow: 0.12,
    status: '#008573',
    avatarFill: '#ccf3ea',
    avatarInk: '#008573',
    sonar: 'rgba(18, 165, 148, 0.18)',
  },
  held: {
    wash: 'rgb(255, 197, 61)',
    washTop: 0.32,
    washLow: 0.18,
    status: '#ab6400',
    avatarFill: '#ffee9c',
    avatarInk: '#ab6400',
    sonar: 'rgba(255, 197, 61, 0.18)',
  },
};

export const CARD_SHADOW = {
  boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.04), 0px 8px 24px rgba(0, 0, 0, 0.07)',
};
export const SHEET_SHADOW = { boxShadow: '0px -8px 24px rgba(0, 0, 0, 0.06)' };
export const PILL_SHADOW = {
  boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.06), 0px 0px 0px 1px rgba(0, 0, 0, 0.04)',
};

export const CALL_TRAY_HEIGHT = 116;
export const callTrayBottom = (safeBottom: number) =>
  safeBottom + (Platform.OS === 'ios' ? 12 : 16);
