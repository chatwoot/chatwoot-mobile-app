// A short drag parks the button at PARK; past COMMIT letting go acts on its own. Between
// PARK and PARK + FILL the row floods with the button's colour.
export const SWIPE_PARK = 68;
export const SWIPE_COMMIT = 150;
export const SWIPE_FILL = 44;
// Below this a released card springs back to the centre instead of parking
export const SWIPE_SETTLE_MIN = 40;
// How much of the drag past COMMIT the card still follows
export const SWIPE_OVERDRAG = 0.35;
export const SWIPE_ROW_HEIGHT = 80;
export const SWIPE_ROW_EXIT = 460;

export const SWIPE_GREEN_RGB = '48, 164, 108';
export const SWIPE_RED_RGB = '229, 72, 106';
export const CARD_FIRST = '#FFFFFF';
export const CARD_REST = '#F2F3F5';
