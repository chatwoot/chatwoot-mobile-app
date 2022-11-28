import { getTextSubstringWithEllipsis } from '../index';

describe('getTextSubstringWithEllipsis', () => {
  it('should return empty string if text is empty', () => {
    expect(getTextSubstringWithEllipsis('', 10)).toBe('');
  });

  it('should return text if text length is less than maxLength', () => {
    expect(getTextSubstringWithEllipsis('Hello', 10)).toBe('Hello');
  });

  it('should return text if text length is equal to maxLength', () => {
    expect(getTextSubstringWithEllipsis('Hello', 5)).toBe('Hello');
  });

  it('should return text with ellipsis if text length is greater than maxLength', () => {
    expect(getTextSubstringWithEllipsis('Hello', 4)).toBe('Hell...');
  });
});
