import { isRTLText, RTL_CHAR_REGEX } from '../rtlUtils';

describe('rtlUtils', () => {
  describe('isRTLText', () => {
    it('returns false for null, undefined, and empty string', () => {
      expect(isRTLText(null)).toBe(false);
      expect(isRTLText(undefined)).toBe(false);
      expect(isRTLText('')).toBe(false);
      expect(isRTLText('   ')).toBe(false);
    });

    it('returns false for Latin text and numbers', () => {
      expect(isRTLText('Hello world')).toBe(false);
      expect(isRTLText('1234567890')).toBe(false);
      expect(isRTLText('!@#$%^&*()_+-=')).toBe(false);
      expect(isRTLText('👋🚀🎉')).toBe(false);
    });

    it('returns true for Arabic text including multiline strings', () => {
      expect(isRTLText('مرحبا')).toBe(true);
      expect(isRTLText('كيف باسوورد \nهذا حسابي حق العمل')).toBe(true);
      expect(isRTLText('السلام عليكم ورحمة الله وبركاته')).toBe(true);
    });

    it('returns true for other RTL languages like Hebrew, Farsi, and Urdu', () => {
      expect(isRTLText('שלום עולם')).toBe(true); // Hebrew
      expect(isRTLText('سلام دنیا')).toBe(true); // Persian
      expect(isRTLText('شکریہ جناب')).toBe(true); // Urdu
    });

    it('returns true for mixed text containing RTL characters', () => {
      expect(isRTLText('Ticket #102: كيف باسوورد')).toBe(true);
      expect(isRTLText('Order completed مرحبا')).toBe(true);
    });
  });

  describe('RTL_CHAR_REGEX', () => {
    it('matches Arabic unicode range', () => {
      expect(RTL_CHAR_REGEX.test('ع')).toBe(true);
    });

    it('matches Arabic Extended-A unicode characters', () => {
      expect(RTL_CHAR_REGEX.test('\u08A0')).toBe(true);
      expect(RTL_CHAR_REGEX.test('\u08FF')).toBe(true);
      expect(isRTLText('Test with Arabic Extended-A \u08A0 char')).toBe(true);
    });

    it('matches Hebrew unicode range', () => {
      expect(RTL_CHAR_REGEX.test('א')).toBe(true);
    });

    it('does not match standard ASCII', () => {
      expect(RTL_CHAR_REGEX.test('abcXYZ123')).toBe(false);
    });
  });
});
