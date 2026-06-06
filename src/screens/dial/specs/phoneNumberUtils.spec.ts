import {
  formatDialedNumber,
  isCompleteDialedNumber,
  normalizeDialedNumber,
  sanitizeDialedNumber,
} from '../utils/phoneNumberUtils';

describe('phoneNumberUtils', () => {
  it('normalizes US dialed numbers', () => {
    expect(normalizeDialedNumber('(202) 555-0198')).toBe('+12025550198');
  });

  it('formats ten digit dialed numbers', () => {
    expect(formatDialedNumber('2025550198')).toBe('(202) 555-0198');
  });

  it('sanitizes pasted phone numbers to digits', () => {
    expect(sanitizeDialedNumber('+1 (202) 555-0198 ext hello')).toBe('12025550198');
  });

  it('validates complete dialed numbers', () => {
    expect(isCompleteDialedNumber('(202) 555-0198')).toBe(true);
    expect(isCompleteDialedNumber('+1 (202) 555-0198')).toBe(true);
    expect(isCompleteDialedNumber('+44 20 7183 8750')).toBe(true);
    expect(isCompleteDialedNumber('202555')).toBe(false);
    expect(isCompleteDialedNumber('02025550198')).toBe(false);
    expect(isCompleteDialedNumber('+1234567890123456')).toBe(false);
  });
});
