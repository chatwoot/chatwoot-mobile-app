import { resolveColorScheme } from '../themeUtils';

describe('resolveColorScheme', () => {
  it('should follow the system scheme when the theme is system', () => {
    expect(resolveColorScheme('system', 'dark')).toBe('dark');
    expect(resolveColorScheme('system', 'light')).toBe('light');
  });

  it('should fall back to light when the system scheme is unknown', () => {
    expect(resolveColorScheme('system', 'unspecified')).toBe('light');
    expect(resolveColorScheme('system', null)).toBe('light');
  });

  it('should let an explicit theme override the system scheme', () => {
    expect(resolveColorScheme('dark', 'light')).toBe('dark');
    expect(resolveColorScheme('light', 'dark')).toBe('light');
  });
});
