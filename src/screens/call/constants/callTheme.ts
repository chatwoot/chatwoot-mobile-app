import { Platform } from 'react-native';

// The call screen's palette, from Radix light. Each phase of a call has a colour that
// washes the backdrop, colours the status line and tints the avatar when there is no photo.
export type CallTone = 'ringing' | 'live' | 'held';

export const CALL_SCREEN_BACKGROUND = '#F4F4F6';
export const CALL_INK = 'hsl(0, 0%, 12.5%)';
export const CALL_MUTED_TEXT = 'hsl(0, 0%, 45%)';
export const CALL_LABEL_TEXT = 'hsl(0, 0%, 40%)';
export const CALL_LINK = 'hsl(208, 93.5%, 47.4%)';
export const CALL_LINK_SOFT = 'hsla(208, 93.5%, 47.4%, 0.1)';
export const CALL_RING_TEXT = 'hsl(208, 93.5%, 40%)';
export const CALL_DIVIDER = 'hsl(240, 5%, 93%)';

// Ruby 9 and Teal 9: the colours of ending and answering
export const CALL_END = '#e54666';
export const CALL_ANSWER = '#12a594';

// A control that is off: a pale grey tile with a mid-grey glyph
export const CONTROL_OFF_FILL = 'hsl(240, 5%, 95%)';
export const CONTROL_OFF_GLYPH = 'hsl(0, 0%, 39.3%)';
// A toggle that is on: Blue 4 with the app's blue glyph
export const CONTROL_ON_FILL = '#d5efff';
export const CONTROL_ON_GLYPH = CALL_LINK;
// A held call's Resume: Amber 4 with Amber 11
export const CONTROL_HOLD_FILL = '#ffee9c';
export const CONTROL_HOLD_GLYPH = '#ab6400';
// A control with nothing to act on yet: an outline, no fill
export const CONTROL_DISABLED_BORDER = 'hsl(240, 5%, 88%)';
export const CONTROL_DISABLED_GLYPH = 'hsl(240, 4%, 72%)';
export const CONTROL_DISABLED_LABEL = 'hsl(0, 0%, 68%)';

type ToneColours = {
  // The backdrop's two washes: the colour and how strongly each shows
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

// Raised white surfaces: the tray, popovers, the strip and the sheet
export const CARD_SHADOW = {
  boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.04), 0px 8px 24px rgba(0, 0, 0, 0.07)',
};
export const SHEET_SHADOW = { boxShadow: '0px -8px 24px rgba(0, 0, 0, 0.06)' };
export const PILL_SHADOW = {
  boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.06), 0px 0px 0px 1px rgba(0, 0, 0, 0.04)',
};

// The control tray: 16pt padding around a 60pt button and its 16pt label
export const CALL_TRAY_HEIGHT = 116;
// Where the tray sits above the bottom safe area
export const callTrayBottom = (safeBottom: number) =>
  safeBottom + (Platform.OS === 'ios' ? 12 : 16);
