// The call card sits on both message bubbles, so its own colours are fixed rather than
// taken from the bubble: a white card with the phase in the icon box.
export type CallBubbleState = 'ringing' | 'live' | 'ended' | 'missed';

export const CARD_INK = '#1C1C1E';
export const CARD_MUTED = '#6B6B70';
export const CARD_SURFACE = '#FFFFFF';
// A missed call an agent placed keeps its warning on the pale grey bubble
export const CARD_MISSED_SURFACE = '#FDEEF1';

export const CALL_RED = '#D6335B';
export const CALL_GREEN = '#1F9D55';
export const CALL_GREEN_INK = '#15803D';
export const CALL_BLUE = '#0E8EFF';
export const CALL_LINK = '#0B72D9';

type StateTone = { icon: string; iconBox: string };

export const CALL_BUBBLE_TONES: Record<CallBubbleState, StateTone> = {
  ringing: { icon: CALL_BLUE, iconBox: 'rgba(14,142,255,0.12)' },
  live: { icon: CALL_GREEN_INK, iconBox: 'rgba(31,157,85,0.14)' },
  ended: { icon: '#55555A', iconBox: 'rgba(0,0,0,0.06)' },
  missed: { icon: CALL_RED, iconBox: 'rgba(214,51,91,0.12)' },
};

// Text on the bubble around the card, which is white on the contact's blue
export const bubbleInk = (lightOnDark: boolean) => (lightOnDark ? '#FFFFFF' : CARD_INK);
export const bubbleMuted = (lightOnDark: boolean) =>
  lightOnDark ? 'rgba(255,255,255,0.9)' : CARD_MUTED;
