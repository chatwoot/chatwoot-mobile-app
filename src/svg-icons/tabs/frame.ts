// Tab icons are drawn on a wide canvas sized for the bottom tab bar, with the glyph in a
// 24×24 frame at (12, 2). `compact` crops to that frame so the glyph is centered, for
// round buttons like the side tab bar on iPhone Duo.
export type TabIconProps = { compact?: boolean };

export const tabIconCanvas = (compact: boolean | undefined, canvasWidth: number) =>
  compact
    ? { width: 24, height: 24, viewBox: '12 2 24 24' }
    : { width: canvasWidth, height: 40, viewBox: `0 0 ${canvasWidth} 40` };
