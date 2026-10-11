import { tailwind } from '../tailwind';

const setColorScheme = (scheme: 'light' | 'dark') =>
  (tailwind as unknown as { setColorScheme: (scheme: string) => void }).setColorScheme(scheme);

describe('tailwind', () => {
  afterEach(() => setColorScheme('light'));

  describe('color', () => {
    it('should resolve a colour without a dark variant in both schemes', () => {
      const light = tailwind.color('bg-white');
      setColorScheme('dark');
      expect(tailwind.color('bg-white')).toBe(light);
    });

    it('should return the light colour in the light scheme', () => {
      expect(tailwind.color('text-gray-950 dark:text-grayDark-950')).toBe(
        tailwind.color('text-gray-950'),
      );
    });

    it('should return the dark variant in the dark scheme', () => {
      setColorScheme('dark');
      expect(tailwind.color('text-gray-950 dark:text-grayDark-950')).toBe(
        tailwind.color('text-grayDark-950'),
      );
      expect(tailwind.color('text-grayDark-950')).not.toBe(tailwind.color('text-gray-950'));
    });
  });

  describe('style', () => {
    it('should apply dark variants only in the dark scheme', () => {
      const classes = 'bg-white dark:bg-grayDark-50';
      expect(tailwind.style(classes)).toEqual({ backgroundColor: '#fff' });
      setColorScheme('dark');
      expect(tailwind.style(classes)).toEqual({
        backgroundColor: tailwind.color('bg-grayDark-50'),
      });
    });
  });
});
