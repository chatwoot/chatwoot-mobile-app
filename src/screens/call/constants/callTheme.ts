import { useMemo } from 'react';
import { Platform } from 'react-native';

import { withAlpha } from '@/theme';
import { useTailwind, type ThemeTailwind } from '@/theme/useTailwind';

export type CallTone = 'ringing' | 'live' | 'held';

type ToneColours = {
  wash: string;
  washTop: number;
  status: string;
  avatarFill: string;
  avatarInk: string;
  sonar: string;
};

const buildCallTheme = (tw: ThemeTailwind) => {
  const token = (name: string) => tw.color(name) as string;

  const RINGING = token('text-blue-800');
  const LIVE = token('text-teal-700');
  const HELD = token('text-amber-700');

  const CALL_INK = token('text-gray-950');
  const CALL_MUTED_TEXT = token('text-call-muted');
  const CALL_LABEL_TEXT = token('text-gray-900');
  const CALL_LINK = RINGING;
  const CALL_LINK_SOFT = withAlpha(RINGING, 0.1);
  const CALL_RING_TEXT = token('text-call-ring-text');
  const CALL_DIVIDER = token('bg-slate-200');

  const CALL_END = token('bg-ruby-700');
  const CALL_ANSWER = LIVE;

  const CONTROL_OFF_FILL = token('bg-gray-100');
  const CONTROL_OFF_GLYPH = token('text-gray-900');
  const CONTROL_ON_FILL = token('bg-call-ringing-fill');
  const CONTROL_ON_GLYPH = CALL_LINK;
  const CONTROL_HOLD_FILL = token('bg-call-held-fill');
  const CONTROL_HOLD_GLYPH = token('text-call-held-ink');
  const CONTROL_DISABLED_BORDER = token('border-slate-400');
  const CONTROL_DISABLED_GLYPH = token('text-call-disabled-glyph');
  const CONTROL_DISABLED_LABEL = token('text-call-disabled-label');

  const CALL_TONES: Record<CallTone, ToneColours> = {
    ringing: {
      wash: RINGING,
      washTop: 0.26,
      status: CALL_RING_TEXT,
      avatarFill: CONTROL_ON_FILL,
      avatarInk: token('text-call-ringing-ink'),
      sonar: withAlpha(RINGING, 0.18),
    },
    live: {
      wash: LIVE,
      washTop: 0.22,
      status: token('text-call-live-ink'),
      avatarFill: token('bg-call-live-fill'),
      avatarInk: token('text-call-live-ink'),
      sonar: withAlpha(LIVE, 0.18),
    },
    held: {
      wash: HELD,
      washTop: 0.32,
      status: CONTROL_HOLD_GLYPH,
      avatarFill: CONTROL_HOLD_FILL,
      avatarInk: CONTROL_HOLD_GLYPH,
      sonar: withAlpha(HELD, 0.18),
    },
  };
  const CALL_SURFACE = token('bg-white');
  const CALL_BACKDROP = tw.isDark ? token('bg-gray-50') : '#F4F4F6';
  const CALL_HANDLE = tw.isDark ? token('bg-gray-500') : '#CCCCCC';
  return {
    CALL_INK,
    CALL_MUTED_TEXT,
    CALL_LABEL_TEXT,
    CALL_LINK,
    CALL_LINK_SOFT,
    CALL_RING_TEXT,
    CALL_DIVIDER,
    CALL_END,
    CALL_ANSWER,
    CONTROL_OFF_FILL,
    CONTROL_OFF_GLYPH,
    CONTROL_ON_FILL,
    CONTROL_ON_GLYPH,
    CONTROL_HOLD_FILL,
    CONTROL_HOLD_GLYPH,
    CONTROL_DISABLED_BORDER,
    CONTROL_DISABLED_GLYPH,
    CONTROL_DISABLED_LABEL,
    CALL_TONES,
    CALL_SURFACE,
    CALL_BACKDROP,
    CALL_HANDLE,
  };
};

export type CallTheme = ReturnType<typeof buildCallTheme>;

export const useCallTheme = (): CallTheme => {
  const tw = useTailwind();
  return useMemo(() => buildCallTheme(tw), [tw]);
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
