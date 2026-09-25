import {
  CHUNK_CHARACTER_BUDGET,
  CHUNK_LINE_BUDGET,
  PREVIEW_CHARACTER_BUDGET,
  PREVIEW_LINE_BUDGET,
  buildPreview,
  isLongMessage,
  splitIntoChunks,
} from '@/utils/markdownChunkUtils';

const repeatLines = (count: number, line = 'line') =>
  Array.from({ length: count }, (_, index) => `${line} ${index}`).join('\n');

const countLines = (content: string) => content.split('\n').length;

describe('#isLongMessage', () => {
  it('returns false for an ordinary message', () => {
    expect(isLongMessage('Thanks, that worked!')).toBe(false);
  });

  it('returns false for an empty message', () => {
    expect(isLongMessage('')).toBe(false);
  });

  it('returns false at exactly the line budget', () => {
    expect(isLongMessage(repeatLines(PREVIEW_LINE_BUDGET))).toBe(false);
  });

  it('returns true one line past the budget', () => {
    expect(isLongMessage(repeatLines(PREVIEW_LINE_BUDGET + 1))).toBe(true);
  });

  it('returns true past the character budget on a single line', () => {
    expect(isLongMessage('a'.repeat(PREVIEW_CHARACTER_BUDGET + 1))).toBe(true);
  });
});

describe('#buildPreview', () => {
  it('returns a short message untouched', () => {
    expect(buildPreview('Thanks, that worked!')).toBe('Thanks, that worked!');
  });

  it('keeps the preview within the line budget', () => {
    const preview = buildPreview(repeatLines(200));

    expect(countLines(preview)).toBeLessThanOrEqual(PREVIEW_LINE_BUDGET);
  });

  it('keeps the preview within the character budget', () => {
    const preview = buildPreview('word '.repeat(5_000));

    // The ellipsis is appended after the budget is applied.
    expect(preview.length).toBeLessThanOrEqual(PREVIEW_CHARACTER_BUDGET + 1);
  });

  it('marks a truncated preview with an ellipsis', () => {
    expect(buildPreview(repeatLines(200)).endsWith('…')).toBe(true);
  });

  it('cuts on a word boundary rather than mid-word', () => {
    const preview = buildPreview('word '.repeat(5_000));

    expect(preview.replace('…', '').endsWith('word')).toBe(true);
  });

  it('cuts mid-word when there is no boundary to use', () => {
    const preview = buildPreview('a'.repeat(PREVIEW_CHARACTER_BUDGET * 2));

    expect(preview).toBe(`${'a'.repeat(PREVIEW_CHARACTER_BUDGET)}…`);
  });

  it('is a prefix of the message it previews', () => {
    const content = repeatLines(200);
    const preview = buildPreview(content).replace('…', '');

    expect(content.startsWith(preview)).toBe(true);
  });
});

describe('#splitIntoChunks', () => {
  it('leaves a message that already fits as a single chunk', () => {
    const chunks = splitIntoChunks('Thanks, that worked!');

    expect(chunks).toEqual([
      { key: '0', content: 'Thanks, that worked!', followsBlankLine: false },
    ]);
  });

  it('splits a message that is over the line budget', () => {
    const chunks = splitIntoChunks(repeatLines(CHUNK_LINE_BUDGET * 3));

    expect(chunks.length).toBeGreaterThan(1);
  });

  it('keeps every chunk within both budgets', () => {
    const chunks = splitIntoChunks(repeatLines(2_000, 'a fairly long log line goes here'));

    chunks.forEach(chunk => {
      expect(chunk.content.length).toBeLessThanOrEqual(CHUNK_CHARACTER_BUDGET);
      expect(countLines(chunk.content)).toBeLessThanOrEqual(CHUNK_LINE_BUDGET);
    });
  });

  it('loses nothing when it splits on line boundaries', () => {
    const content = repeatLines(2_000, 'a fairly long log line goes here');
    const chunks = splitIntoChunks(content);

    expect(chunks.map(chunk => chunk.content).join('\n')).toBe(content);
  });

  it('preserves blank lines across a seam', () => {
    const content = Array.from({ length: 400 }, (_, index) => `paragraph ${index}`).join('\n\n');
    const chunks = splitIntoChunks(content);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.map(chunk => chunk.content).join('\n')).toBe(content);
  });

  it('flags a seam that fell on a blank line so the block gap survives', () => {
    const content = Array.from({ length: 400 }, (_, index) => `paragraph ${index}`).join('\n\n');
    const chunks = splitIntoChunks(content);

    expect(chunks.slice(1).some(chunk => chunk.followsBlankLine)).toBe(true);
    expect(chunks[0].followsBlankLine).toBe(false);
  });

  it('breaks a single line that is wider than a chunk on its own', () => {
    const content = 'token '.repeat(CHUNK_CHARACTER_BUDGET);
    const chunks = splitIntoChunks(content);

    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach(chunk => {
      expect(chunk.content.length).toBeLessThanOrEqual(CHUNK_CHARACTER_BUDGET);
    });
  });

  it('loses no characters when it breaks a single long line', () => {
    const content = 'token '.repeat(CHUNK_CHARACTER_BUDGET);
    const chunks = splitIntoChunks(content);
    const rejoined = chunks
      .map(chunk => chunk.content)
      .join('\n')
      .split('\n')
      .join('');

    expect(rejoined).toBe(content);
  });

  it('breaks an unbroken blob with no spaces to cut on', () => {
    const content = 'a'.repeat(CHUNK_CHARACTER_BUDGET * 3 + 17);
    const chunks = splitIntoChunks(content);

    expect(chunks).toHaveLength(4);
    chunks.forEach(chunk => {
      expect(chunk.content.length).toBeLessThanOrEqual(CHUNK_CHARACTER_BUDGET);
    });
    expect(chunks.map(chunk => chunk.content).join('').length).toBe(content.length);
  });
});
