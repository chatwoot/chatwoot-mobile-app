import { highlightText } from '@/utils/highlightText';

describe('highlightText', () => {
  describe('edge cases', () => {
    it('should return empty segment for empty text', () => {
      expect(highlightText('', 'search')).toEqual([{ text: '', isHighlight: false }]);
    });

    it('should return original text when search term is empty', () => {
      expect(highlightText('hello world', '')).toEqual([{ text: 'hello world', isHighlight: false }]);
    });

    it('should return original text when search term is whitespace', () => {
      expect(highlightText('hello world', '   ')).toEqual([
        { text: 'hello world', isHighlight: false },
      ]);
    });

    it('should return original text when there is no match', () => {
      expect(highlightText('hello world', 'xyz')).toEqual([
        { text: 'hello world', isHighlight: false },
      ]);
    });
  });

  describe('basic matching', () => {
    it('should highlight a match at the start', () => {
      expect(highlightText('hello world', 'hello')).toEqual([
        { text: 'hello', isHighlight: true },
        { text: ' world', isHighlight: false },
      ]);
    });

    it('should highlight a match at the end', () => {
      expect(highlightText('hello world', 'world')).toEqual([
        { text: 'hello ', isHighlight: false },
        { text: 'world', isHighlight: true },
      ]);
    });

    it('should highlight a match in the middle', () => {
      expect(highlightText('hello beautiful world', 'beautiful')).toEqual([
        { text: 'hello ', isHighlight: false },
        { text: 'beautiful', isHighlight: true },
        { text: ' world', isHighlight: false },
      ]);
    });

    it('should highlight when entire text matches', () => {
      expect(highlightText('hello', 'hello')).toEqual([{ text: 'hello', isHighlight: true }]);
    });
  });

  describe('case-insensitive matching', () => {
    it('should match regardless of case', () => {
      expect(highlightText('Hello World', 'hello')).toEqual([
        { text: 'Hello', isHighlight: true },
        { text: ' World', isHighlight: false },
      ]);
    });

    it('should preserve original casing in output', () => {
      const result = highlightText('Hello HELLO hello', 'hello');
      expect(result).toEqual([
        { text: 'Hello', isHighlight: true },
        { text: ' ', isHighlight: false },
        { text: 'HELLO', isHighlight: true },
        { text: ' ', isHighlight: false },
        { text: 'hello', isHighlight: true },
      ]);
    });
  });

  describe('multiple matches', () => {
    it('should highlight all occurrences', () => {
      expect(highlightText('ab ab ab', 'ab')).toEqual([
        { text: 'ab', isHighlight: true },
        { text: ' ', isHighlight: false },
        { text: 'ab', isHighlight: true },
        { text: ' ', isHighlight: false },
        { text: 'ab', isHighlight: true },
      ]);
    });

    it('should highlight consecutive matches', () => {
      expect(highlightText('aaa', 'a')).toEqual([
        { text: 'a', isHighlight: true },
        { text: 'a', isHighlight: true },
        { text: 'a', isHighlight: true },
      ]);
    });
  });

  describe('special regex characters', () => {
    it('should handle dots', () => {
      expect(highlightText('file.txt', '.')).toEqual([
        { text: 'file', isHighlight: false },
        { text: '.', isHighlight: true },
        { text: 'txt', isHighlight: false },
      ]);
    });

    it('should handle parentheses', () => {
      expect(highlightText('fn(x)', '(x)')).toEqual([
        { text: 'fn', isHighlight: false },
        { text: '(x)', isHighlight: true },
      ]);
    });

    it('should handle brackets and other special chars', () => {
      expect(highlightText('a+b=c', '+b=')).toEqual([
        { text: 'a', isHighlight: false },
        { text: '+b=', isHighlight: true },
        { text: 'c', isHighlight: false },
      ]);
    });
  });

  describe('partial word matching', () => {
    it('should match partial words', () => {
      expect(highlightText('unhappy', 'happy')).toEqual([
        { text: 'un', isHighlight: false },
        { text: 'happy', isHighlight: true },
      ]);
    });
  });

  describe('whitespace handling', () => {
    it('should trim the search term before matching', () => {
      expect(highlightText('hello world', '  hello  ')).toEqual([
        { text: 'hello', isHighlight: true },
        { text: ' world', isHighlight: false },
      ]);
    });

    it('should preserve whitespace in the text', () => {
      expect(highlightText('  hello  ', 'hello')).toEqual([
        { text: '  ', isHighlight: false },
        { text: 'hello', isHighlight: true },
        { text: '  ', isHighlight: false },
      ]);
    });
  });
});
