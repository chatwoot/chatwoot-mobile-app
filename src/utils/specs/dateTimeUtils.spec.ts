import {
  formatTimeToShortForm,
  formatRelativeTime,
  unixTimestampToReadableTime,
  messageStamp,
} from '@/utils/dateTimeUtils';

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

// [conomni] m9: время должно быть в 24-часовом формате (было '08:52 AM'), продукт русский.
// Таймстампы строятся из локального Date, поэтому тест не зависит от TZ окружения.
describe('unixTimestampToReadableTime', () => {
  it('formats evening time as 24-hour, without AM/PM', () => {
    const localDate = new Date(2026, 0, 15, 20, 5, 0);
    const unixTimestamp = Math.floor(localDate.getTime() / 1000);
    expect(unixTimestampToReadableTime(unixTimestamp)).toBe('20:05');
  });

  it('formats midnight as "00:05", not "12:05 AM"', () => {
    const localDate = new Date(2026, 0, 15, 0, 5, 0);
    const unixTimestamp = Math.floor(localDate.getTime() / 1000);
    expect(unixTimestampToReadableTime(unixTimestamp)).toBe('00:05');
  });

  it('formats noon as "12:00", not "12:00 PM"', () => {
    const localDate = new Date(2026, 0, 15, 12, 0, 0);
    const unixTimestamp = Math.floor(localDate.getTime() / 1000);
    expect(unixTimestampToReadableTime(unixTimestamp)).toBe('12:00');
  });
});

describe('messageStamp', () => {
  it('defaults to 24-hour format', () => {
    const localDate = new Date(2026, 0, 15, 20, 5, 0);
    const unixTimestamp = Math.floor(localDate.getTime() / 1000);
    expect(messageStamp({ time: unixTimestamp })).toBe('20:05');
  });
});
