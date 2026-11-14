import { useAppAppearance } from '../appearance';
import { useTailwind } from '../useTailwind';

jest.mock('../appearance', () => ({ useAppAppearance: jest.fn() }));

const usePalette = (scheme: 'light' | 'dark') => {
  (useAppAppearance as jest.Mock).mockReturnValue(scheme);
  return useTailwind();
};

describe('appearance palettes', () => {
  it('changes surfaces and text while preserving white message text', () => {
    const light = usePalette('light');
    const dark = usePalette('dark');
    expect(dark.color('bg-white')).not.toBe(light.color('bg-white'));
    expect(dark.color('text-gray-950')).not.toBe(light.color('text-gray-950'));
    expect(dark.color('text-white')).toBe(light.color('text-white'));
    expect(dark.style('bg-white text-gray-950')).toEqual({
      backgroundColor: dark.color('bg-white'),
      color: dark.color('text-gray-950'),
    });
  });

  it('keeps interaction separators and selection visible on dark surfaces', () => {
    const dark = usePalette('dark');
    expect(dark.style('border-b-blackA-A3').borderBottomColor).toBe(dark.color('whiteA-A3'));
    expect(dark.style('bg-blackA-A3').backgroundColor).toBe(dark.color('whiteA-A3'));
    expect(dark.style('bg-[#EBEBEB]').backgroundColor).toBe(dark.color('gray-200'));
  });

  it('does not invert overlay scrims, white-alpha materials or message accents', () => {
    const light = usePalette('light');
    const dark = usePalette('dark');
    expect(dark.color('bg-blackA-A9')).toBe(light.color('bg-blackA-A9'));
    expect(dark.color('bg-whiteA-A3')).toBe(light.color('bg-whiteA-A3'));
    expect(dark.color('bg-blue-800')).toBeDefined();
    expect(dark.color('bg-amber-100')).toBeDefined();
  });

  it('handles conditional styles and returns stable palettes across renders', () => {
    const dark = usePalette('dark');
    expect(dark.style({ 'bg-white': true, 'text-gray-950': false })).toEqual({
      backgroundColor: dark.color('bg-white'),
    });
    expect(usePalette('dark')).toBe(dark);
    expect(usePalette('light').isDark).toBe(false);
  });
});
