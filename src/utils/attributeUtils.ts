import { camelCase } from 'lodash';
import type { CustomAttribute } from '@/types';

/**
 * Custom attribute values arrive from the API as arbitrary JSON, so a value
 * reaching the attribute list can be a number, a boolean, or an object. Text
 * rendering and the clipboard both take a string.
 */
export const formatAttributeValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return '';
    }
  }
  return String(value);
};

export type RequiredAttributeValue = string | boolean | null;

export type AttributeValueError = 'REQUIRED' | 'INVALID_URL' | 'INVALID_NUMBER' | 'INVALID_INPUT';

const URL_PATTERN = /^(https?|ftp):\/\/[^\s/$.?#][^\s]*$/i;

/**
 * Required attributes the conversation has not filled. Conversation custom
 * attributes are stored with camelCased keys. A checkbox counts as filled once
 * it holds true or false; any other value counts once it has non-blank text.
 */
export const getMissingRequiredAttributes = (
  requiredAttributes: CustomAttribute[],
  customAttributes: Record<string, unknown>,
) =>
  requiredAttributes.filter(attribute => {
    const value = customAttributes[camelCase(attribute.attributeKey)];
    if (attribute.attributeDisplayType === 'checkbox') {
      return value == null;
    }
    return value == null || String(value).trim() === '';
  });

// Patterns are stored in the /pattern/flags form.
export const getRegexp = (regexPatternValue: string) => {
  const lastSlash = regexPatternValue.lastIndexOf('/');
  return new RegExp(regexPatternValue.slice(1, lastSlash), regexPatternValue.slice(lastSlash + 1));
};

export const getInitialAttributeValue = (
  attribute: CustomAttribute,
  presetValue: unknown,
): RequiredAttributeValue => {
  if (attribute.attributeDisplayType === 'checkbox') {
    return typeof presetValue === 'boolean' ? presetValue : null;
  }
  return formatAttributeValue(presetValue);
};

export const getAttributeValueError = (
  attribute: CustomAttribute,
  value: RequiredAttributeValue,
): AttributeValueError | null => {
  const type = attribute.attributeDisplayType;
  if (type === 'checkbox') {
    return value === null ? 'REQUIRED' : null;
  }

  const text = typeof value === 'string' ? value : '';
  if (!text.trim()) {
    return 'REQUIRED';
  }
  if (type === 'link') {
    return URL_PATTERN.test(text) ? null : 'INVALID_URL';
  }
  if (type === 'number' && Number.isNaN(Number(text))) {
    return 'INVALID_NUMBER';
  }
  if (attribute.regexPattern && !getRegexp(attribute.regexPattern).test(text)) {
    return 'INVALID_INPUT';
  }
  return null;
};

export const getSavedAttributeValue = (
  attribute: CustomAttribute,
  value: RequiredAttributeValue,
) => {
  if (attribute.attributeDisplayType === 'number' && typeof value === 'string') {
    return Number(value.trim());
  }
  return value;
};
