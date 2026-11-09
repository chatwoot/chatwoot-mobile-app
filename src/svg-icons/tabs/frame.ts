export type TabIconProps = { compact?: boolean | number };

const COMPACT_SIZE = 28;
const COMPACT_DRAWN_SIZE = 24;

export const tabIconCanvas = (
  compact: boolean | number | undefined,
  canvasWidth: number,
  glyphCenterY = 14,
) =>
  compact
    ? {
        width: typeof compact === 'number' ? compact : COMPACT_DRAWN_SIZE,
        height: typeof compact === 'number' ? compact : COMPACT_DRAWN_SIZE,
        viewBox: `${24 - COMPACT_SIZE / 2} ${glyphCenterY - COMPACT_SIZE / 2} ${COMPACT_SIZE} ${COMPACT_SIZE}`,
      }
    : { width: canvasWidth, height: 40, viewBox: `0 0 ${canvasWidth} 40` };
