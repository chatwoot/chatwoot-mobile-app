/**
 * Budgets that keep a message inside what iOS can lay out in a frame.
 *
 * Under Fabric, `RCTTextLayoutManager` builds a fresh `NSTextStorage`,
 * `NSLayoutManager` and `NSTextContainer` inside `drawAttributedString:` and
 * caches only the attributed string, so no layout survives between draws. Paper
 * kept one on the shadow view and reused it, which is why long messages only
 * began hanging the main thread when the New Architecture went on in v4.9.0.
 *
 * TextKit's cost grows with the square of the line fragments in one container,
 * markdown keeps a run of newline-separated lines in a single paragraph, and
 * FlashList redraws a row each time it recycles. A pasted log therefore reaches
 * iOS as one container holding thousands of fragments, re-laid-out on the main
 * thread on every pass.
 *
 * Splitting the same text across several containers keeps each fragment count
 * low, which turns that quadratic cost back into a linear one.
 */

/**
 * Characters shown before a long message collapses behind "Show more". Well
 * inside what iOS lays out in a frame — the ceiling here is how much an agent
 * wants to scroll past, not what the text system can take.
 */
export const PREVIEW_CHARACTER_BUDGET = 2_000;

/** Lines shown before a long message collapses behind "Show more". */
export const PREVIEW_LINE_BUDGET = 40;

/** Characters allowed in one chunk, and so in one `NSTextContainer`. */
export const CHUNK_CHARACTER_BUDGET = 8_000;

/** Lines allowed in one chunk, and so in one `NSTextContainer`. */
export const CHUNK_LINE_BUDGET = 150;

/** Chunks revealed per "Show more" tap, so one tap stays within a frame or two. */
export const CHUNKS_PER_REVEAL = 16;

export type MarkdownChunk = {
  key: string;
  content: string;
  /**
   * True when the split before this chunk fell on a blank line. The renderer
   * spaces markdown blocks with a row gap it can only apply inside a single
   * chunk, so the seam has to carry that gap itself.
   */
  followsBlankLine: boolean;
};

/**
 * Counts newlines without allocating the array `split` would. Only ever called
 * on strings already known to be within the character budget.
 */
const countNewlines = (content: string) => {
  let count = 0;
  let index = content.indexOf('\n');

  while (index !== -1) {
    count += 1;
    index = content.indexOf('\n', index + 1);
  }

  return count;
};

const exceedsBudget = (content: string, characterBudget: number, lineBudget: number) =>
  content.length > characterBudget || countNewlines(content) + 1 > lineBudget;

/** True when a message is long enough to collapse behind "Show more". */
export const isLongMessage = (content: string) =>
  exceedsBudget(content, PREVIEW_CHARACTER_BUDGET, PREVIEW_LINE_BUDGET);

/**
 * Cuts at the last line break in range, else the last space, else the budget
 * itself. A boundary is only worth taking when it keeps most of the budget,
 * otherwise the preview loses more than the tidier cut is worth.
 */
const cutAtBoundary = (content: string, budget: number) => {
  if (content.length <= budget) {
    return content;
  }

  const window = content.slice(0, budget);
  const earliestAcceptable = Math.floor(budget * 0.6);
  const boundary = Math.max(window.lastIndexOf('\n'), window.lastIndexOf(' '));

  return boundary >= earliestAcceptable ? window.slice(0, boundary) : window;
};

/** Keeps at most `lineBudget` lines, dropping the newline that ends the last. */
const cutToLineBudget = (content: string, lineBudget: number) => {
  let index = 0;

  for (let line = 0; line < lineBudget; line += 1) {
    const next = content.indexOf('\n', index);

    if (next === -1) {
      return content;
    }

    index = next + 1;
  }

  return content.slice(0, index - 1);
};

/** The opening slice of a long message, ellipsised when anything was dropped. */
export const buildPreview = (content: string) => {
  const preview = cutAtBoundary(
    cutToLineBudget(content, PREVIEW_LINE_BUDGET),
    PREVIEW_CHARACTER_BUDGET,
  );

  if (preview.length === content.length) {
    return content;
  }

  return `${preview.replace(/\s+$/, '')}…`;
};

/**
 * Breaks a line that is on its own wider than a chunk — a base64 blob or a
 * minified payload — at spaces where iOS would have wrapped it anyway.
 */
const breakLongLine = (line: string) => {
  const pieces: string[] = [];
  let cursor = 0;

  while (line.length - cursor > CHUNK_CHARACTER_BUDGET) {
    const window = line.slice(cursor, cursor + CHUNK_CHARACTER_BUDGET);
    const boundary = window.lastIndexOf(' ');
    const length =
      boundary >= Math.floor(CHUNK_CHARACTER_BUDGET * 0.6) ? boundary + 1 : CHUNK_CHARACTER_BUDGET;

    pieces.push(line.slice(cursor, cursor + length));
    cursor += length;
  }

  pieces.push(line.slice(cursor));

  return pieces;
};

/**
 * Packs a message into chunks that each stay within one container's budget,
 * preferring to break where a markdown block already ends.
 */
export const splitIntoChunks = (content: string): MarkdownChunk[] => {
  if (!exceedsBudget(content, CHUNK_CHARACTER_BUDGET, CHUNK_LINE_BUDGET)) {
    return [{ key: '0', content, followsBlankLine: false }];
  }

  const lines = content.split('\n').flatMap(breakLongLine);
  const chunks: MarkdownChunk[] = [];

  let current: string[] = [];
  let currentLength = 0;
  let followsBlankLine = false;

  const flush = () => {
    if (current.length === 0) {
      return;
    }

    // A trailing blank line is whitespace markdown drops, so the block gap it
    // stood for has to reappear at the seam instead.
    const endsOnBlankLine = current[current.length - 1].trim() === '';

    chunks.push({
      key: String(chunks.length),
      content: current.join('\n'),
      followsBlankLine,
    });

    followsBlankLine = endsOnBlankLine;
    current = [];
    currentLength = 0;
  };

  lines.forEach(line => {
    const lengthWithLine = currentLength + line.length + (current.length === 0 ? 0 : 1);
    const overCharacters = current.length > 0 && lengthWithLine > CHUNK_CHARACTER_BUDGET;
    const overLines = current.length >= CHUNK_LINE_BUDGET;

    if (overCharacters || overLines) {
      flush();
    }

    current.push(line);
    currentLength += line.length + (current.length === 1 ? 0 : 1);
  });

  flush();

  return chunks;
};
