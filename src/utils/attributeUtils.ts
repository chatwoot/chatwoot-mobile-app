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
