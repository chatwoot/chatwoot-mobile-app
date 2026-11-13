import type { CustomAttribute } from '@/types';
import {
  formatAttributeValue,
  getAttributeValueError,
  getMissingRequiredAttributes,
  getSavedAttributeValue,
} from '../attributeUtils';

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

const attribute = (overrides: Partial<CustomAttribute>): CustomAttribute => ({
  id: 1,
  attributeDisplayName: 'Ticket reference',
  attributeDisplayType: 'text',
  attributeDescription: '',
  attributeKey: 'ticket_ref',
  regexPattern: '',
  regexCue: '',
  attributeValues: [],
  attributeModel: 'conversation_attribute',
  defaultValue: '',
  createdAt: '',
  updatedAt: '',
  value: '',
  ...overrides,
});

describe('getMissingRequiredAttributes', () => {
  const text = attribute({ attributeKey: 'ticket_ref' });
  const number = attribute({ attributeKey: 'order_value', attributeDisplayType: 'number' });
  const checkbox = attribute({ attributeKey: 'plan_2b', attributeDisplayType: 'checkbox' });
  const required = [text, number, checkbox];

  it('returns every attribute when nothing is filled', () => {
    expect(getMissingRequiredAttributes(required, {})).toEqual(required);
  });

  it('reads the camelCased keys the store holds', () => {
    expect(
      getMissingRequiredAttributes(required, { ticketRef: 'TKT-1', orderValue: 0, plan2B: false }),
    ).toEqual([]);
  });

  it('treats blank text and a null checkbox as missing', () => {
    expect(
      getMissingRequiredAttributes(required, { ticketRef: '   ', orderValue: 5, plan2B: null }),
    ).toEqual([text, checkbox]);
  });
});

describe('getAttributeValueError', () => {
  it('requires a value', () => {
    expect(getAttributeValueError(attribute({}), '  ')).toBe('REQUIRED');
    expect(getAttributeValueError(attribute({ attributeDisplayType: 'checkbox' }), null)).toBe(
      'REQUIRED',
    );
  });

  it('accepts false for a checkbox', () => {
    expect(getAttributeValueError(attribute({ attributeDisplayType: 'checkbox' }), false)).toBe(
      null,
    );
  });

  it('validates links and numbers', () => {
    const link = attribute({ attributeDisplayType: 'link' });
    const number = attribute({ attributeDisplayType: 'number' });
    expect(getAttributeValueError(link, 'example.com')).toBe('INVALID_URL');
    expect(getAttributeValueError(link, 'https://example.com/a')).toBe(null);
    expect(getAttributeValueError(number, '12abc')).toBe('INVALID_NUMBER');
    expect(getAttributeValueError(number, '-1.5')).toBe(null);
  });

  it('applies the attribute regex', () => {
    const withRegex = attribute({ regexPattern: '/^TKT-\\d+$/' });
    expect(getAttributeValueError(withRegex, 'ABC')).toBe('INVALID_INPUT');
    expect(getAttributeValueError(withRegex, 'TKT-12')).toBe(null);
  });
});

describe('getSavedAttributeValue', () => {
  it('saves numbers as numbers', () => {
    expect(getSavedAttributeValue(attribute({ attributeDisplayType: 'number' }), ' 42 ')).toBe(42);
    expect(getSavedAttributeValue(attribute({}), 'TKT-1')).toBe('TKT-1');
  });
});
