import { getTextSubstringWithEllipsis, getUserInitial } from '../index';

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

describe('getUserInitial', () => {
  it('should return empty string if name is empty', () => {
    expect(getUserInitial('')).toBe('');
  });

  it('should return first letter of name if name is not empty', () => {
    expect(
      getUserInitial({
        userName: 'John',
      }),
    ).toBe('J');
  });

  it('should return initial of name if name if first name and last name exist', () => {
    expect(
      getUserInitial({
        userName: 'John Doe',
      }),
    ).toBe('JD');
  });

  it('should return initial of name if name if first name, middle name and last name exist', () => {
    expect(getUserInitial({ userName: 'John Smith Doe' })).toBe('JS');
  });
});
