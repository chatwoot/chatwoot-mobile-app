import { formatAttributeValue } from '../attributeUtils';

describe('formatAttributeValue', () => {
  it('passes a string through', () => {
    expect(formatAttributeValue('Premium')).toBe('Premium');
  });

  it.each([
    [39.99, '39.99'],
    [762781672, '762781672'],
    [0, '0'],
    [true, 'true'],
  ])('renders %p as text', (value, expected) => {
    expect(formatAttributeValue(value)).toBe(expected);
  });

  it('renders an object as JSON', () => {
    expect(formatAttributeValue({ menu: 1, opciones: 2 })).toBe('{"menu":1,"opciones":2}');
  });

  it('renders an array as JSON', () => {
    expect(formatAttributeValue(['a', 'b'])).toBe('["a","b"]');
  });

  it('returns an empty string for a circular object', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    expect(formatAttributeValue(circular)).toBe('');
  });

  it.each([[null], [undefined]])('returns an empty string for %p', value => {
    expect(formatAttributeValue(value)).toBe('');
  });
});
