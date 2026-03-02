import { highlightText } from '@/utils/highlightText';

describe('highlightText', () => {
  it('returns empty non-highlight segment when text is empty', () => {
    expect(highlightText('', 'hello')).toEqual([{ text: '', isHighlight: false }]);
  });

  it('returns original text when search term is empty or whitespace', () => {
    expect(highlightText('Hello world', '')).toEqual([{ text: 'Hello world', isHighlight: false }]);
    expect(highlightText('Hello world', '   ')).toEqual([{ text: 'Hello world', isHighlight: false }]);
  });

  it('matches text case-insensitively', () => {
    expect(highlightText('Hello hELLo', 'hello')).toEqual([
      { text: 'Hello', isHighlight: true },
      { text: ' ', isHighlight: false },
      { text: 'hELLo', isHighlight: true },
    ]);
  });

  it('treats special regex characters in search as literal text', () => {
    expect(highlightText('a+b and a+b?', 'a+b')).toEqual([
      { text: 'a+b', isHighlight: true },
      { text: ' and ', isHighlight: false },
      { text: 'a+b', isHighlight: true },
      { text: '?', isHighlight: false },
    ]);
  });

  it('highlights repeated adjacent non-overlapping matches', () => {
    expect(highlightText('aaaa', 'aa')).toEqual([
      { text: 'aa', isHighlight: true },
      { text: 'aa', isHighlight: true },
    ]);
  });

  it('returns original text when there are no matches', () => {
    expect(highlightText('chatwoot', 'hello')).toEqual([{ text: 'chatwoot', isHighlight: false }]);
  });
});
