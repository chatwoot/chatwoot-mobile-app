import { getShortTimeStamp } from '../getShortTimeStamp';

describe('getShortTimeStamp', () => {
  it('should handle special cases', () => {
    expect(getShortTimeStamp('less than a minute ago')).toBe('now');
    expect(getShortTimeStamp('a minute ago')).toBe('1m');
    expect(getShortTimeStamp('an hour ago')).toBe('1h');
    expect(getShortTimeStamp('a day ago')).toBe('1d');
    expect(getShortTimeStamp('a month ago')).toBe('1mo');
    expect(getShortTimeStamp('a year ago')).toBe('1y');
  });

  it('should handle special cases with "ago" suffix', () => {
    expect(getShortTimeStamp('less than a minute ago', true)).toBe('now');
    expect(getShortTimeStamp('a minute ago', true)).toBe('1m ago');
    expect(getShortTimeStamp('an hour ago', true)).toBe('1h ago');
    expect(getShortTimeStamp('a day ago', true)).toBe('1d ago');
    expect(getShortTimeStamp('a month ago', true)).toBe('1mo ago');
    expect(getShortTimeStamp('a year ago', true)).toBe('1y ago');
  });

  it('should handle regular time formats', () => {
    expect(getShortTimeStamp('2 minutes ago')).toBe('2m');
    expect(getShortTimeStamp('5 hours ago')).toBe('5h');
    expect(getShortTimeStamp('3 days ago')).toBe('3d');
    expect(getShortTimeStamp('6 months ago')).toBe('6mo');
    expect(getShortTimeStamp('2 years ago')).toBe('2y');
  });

  it('should handle regular time formats with "ago" suffix', () => {
    expect(getShortTimeStamp('2 minutes ago', true)).toBe('2m ago');
    expect(getShortTimeStamp('5 hours ago', true)).toBe('5h ago');
    expect(getShortTimeStamp('3 days ago', true)).toBe('3d ago');
    expect(getShortTimeStamp('6 months ago', true)).toBe('6mo ago');
    expect(getShortTimeStamp('2 years ago', true)).toBe('2y ago');
  });

  it('should handle time strings with "about/over/almost"', () => {
    expect(getShortTimeStamp('about 2 minutes ago')).toBe(' 2m');
    expect(getShortTimeStamp('over 5 hours ago')).toBe(' 5h');
    expect(getShortTimeStamp('almost 3 days ago')).toBe(' 3d');
  });
});
