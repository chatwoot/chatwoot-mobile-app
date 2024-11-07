import { formatTimeToShortForm, formatRelativeTime } from '../dateTimeUtils';

describe('#dynamicTime', () => {
  it('returns correct value', () => {
    Date.now = jest.fn(() => new Date(Date.UTC(2023, 1, 14)).valueOf());
    expect(formatRelativeTime(1612971343)).toEqual('about 2 years ago');
  });
});

describe('formatTimeToShortForm', () => {
  it('should handle special cases', () => {
    expect(formatTimeToShortForm('less than a minute ago')).toBe('now');
    expect(formatTimeToShortForm('a minute ago')).toBe('1m');
    expect(formatTimeToShortForm('an hour ago')).toBe('1h');
    expect(formatTimeToShortForm('a day ago')).toBe('1d');
    expect(formatTimeToShortForm('a month ago')).toBe('1mo');
    expect(formatTimeToShortForm('a year ago')).toBe('1y');
  });

  it('should handle special cases with "ago" suffix', () => {
    expect(formatTimeToShortForm('less than a minute ago', true)).toBe('now');
    expect(formatTimeToShortForm('a minute ago', true)).toBe('1m ago');
    expect(formatTimeToShortForm('an hour ago', true)).toBe('1h ago');
    expect(formatTimeToShortForm('a day ago', true)).toBe('1d ago');
    expect(formatTimeToShortForm('a month ago', true)).toBe('1mo ago');
    expect(formatTimeToShortForm('a year ago', true)).toBe('1y ago');
  });

  it('should handle regular time formats', () => {
    expect(formatTimeToShortForm('2 minutes ago')).toBe('2m');
    expect(formatTimeToShortForm('5 hours ago')).toBe('5h');
    expect(formatTimeToShortForm('3 days ago')).toBe('3d');
    expect(formatTimeToShortForm('6 months ago')).toBe('6mo');
    expect(formatTimeToShortForm('2 years ago')).toBe('2y');
  });

  it('should handle regular time formats with "ago" suffix', () => {
    expect(formatTimeToShortForm('2 minutes ago', true)).toBe('2m ago');
    expect(formatTimeToShortForm('5 hours ago', true)).toBe('5h ago');
    expect(formatTimeToShortForm('3 days ago', true)).toBe('3d ago');
    expect(formatTimeToShortForm('6 months ago', true)).toBe('6mo ago');
    expect(formatTimeToShortForm('2 years ago', true)).toBe('2y ago');
  });

  it('should handle time strings with "about/over/almost"', () => {
    expect(formatTimeToShortForm('about 2 minutes ago')).toBe(' 2m');
    expect(formatTimeToShortForm('over 5 hours ago')).toBe(' 5h');
    expect(formatTimeToShortForm('almost 3 days ago')).toBe(' 3d');
  });
});
