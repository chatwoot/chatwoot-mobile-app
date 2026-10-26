// Tab icons are drawn on a wide canvas sized for the bottom tab bar. `compact` crops to a
// 28×28 frame centered on the glyph, for round buttons like the side tab bar on iPhone
// Duo. 28pt leaves room for each glyph's full measured size (Inbox 25×20, Conversations
// 23.5×23.5, Settings 23.4×25.7, close to Apple's tab icon targets) so nothing is clipped,
// and centering on each glyph keeps them optically aligned.
export type TabIconProps = { compact?: boolean };

const COMPACT_SIZE = 28;
const COMPACT_DRAWN_SIZE = 24;

/**
 * @param canvasWidth width of the icon's full canvas (its height is 40)
 * @param glyphCenterY vertical center of the drawn glyph on that canvas (all are centered
 *   horizontally at 24)
 */
export const tabIconCanvas = (
  compact: boolean | undefined,
  canvasWidth: number,
  glyphCenterY = 14,
) =>
  compact
    ? {
        // Drawn at 24pt so the tab glyphs (about 22–24pt) match the side toolbar's icons.
        width: COMPACT_DRAWN_SIZE,
        height: COMPACT_DRAWN_SIZE,
        viewBox: `${24 - COMPACT_SIZE / 2} ${glyphCenterY - COMPACT_SIZE / 2} ${COMPACT_SIZE} ${COMPACT_SIZE}`,
      }
    : { width: canvasWidth, height: 40, viewBox: `0 0 ${canvasWidth} 40` };
