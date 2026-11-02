import { Platform } from 'react-native';

import { tailwind } from '@/theme';

export type CallTone = 'ringing' | 'live' | 'held';

const token = (name: string) => tailwind.color(name) as string;

// twrnc drops the /opacity modifier on the palette's hsl colours
const withAlpha = (colour: string, alpha: number) =>
  colour.replace(/^hsl\((.*)\)$/, `hsla($1, ${alpha})`);

const RINGING = token('text-blue-800');
const LIVE = token('text-teal-700');
const HELD = token('text-amber-700');

export const CALL_INK = token('text-gray-950');
export const CALL_MUTED_TEXT = token('text-call-muted');
export const CALL_LABEL_TEXT = token('text-gray-900');
export const CALL_LINK = RINGING;
export const CALL_LINK_SOFT = withAlpha(RINGING, 0.1);
export const CALL_RING_TEXT = token('text-call-ring-text');
export const CALL_DIVIDER = token('bg-slate-200');

export const CALL_END = token('bg-ruby-700');
export const CALL_ANSWER = LIVE;

export const CONTROL_OFF_FILL = token('bg-gray-100');
export const CONTROL_OFF_GLYPH = token('text-gray-900');
export const CONTROL_ON_FILL = token('bg-call-ringing-fill');
export const CONTROL_ON_GLYPH = CALL_LINK;
export const CONTROL_HOLD_FILL = token('bg-call-held-fill');
export const CONTROL_HOLD_GLYPH = token('text-call-held-ink');
export const CONTROL_DISABLED_BORDER = token('border-slate-400');
export const CONTROL_DISABLED_GLYPH = token('text-call-disabled-glyph');
export const CONTROL_DISABLED_LABEL = token('text-call-disabled-label');

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
    wash: RINGING,
    washTop: 0.26,
    washLow: 0.14,
    status: CALL_RING_TEXT,
    avatarFill: CONTROL_ON_FILL,
    avatarInk: token('text-call-ringing-ink'),
    sonar: withAlpha(RINGING, 0.18),
  },
  live: {
    wash: LIVE,
    washTop: 0.22,
    washLow: 0.12,
    status: token('text-call-live-ink'),
    avatarFill: token('bg-call-live-fill'),
    avatarInk: token('text-call-live-ink'),
    sonar: withAlpha(LIVE, 0.18),
  },
  held: {
    wash: HELD,
    washTop: 0.32,
    washLow: 0.18,
    status: CONTROL_HOLD_GLYPH,
    avatarFill: CONTROL_HOLD_FILL,
    avatarInk: CONTROL_HOLD_GLYPH,
    sonar: withAlpha(HELD, 0.18),
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
