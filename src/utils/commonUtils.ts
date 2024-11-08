import camelcaseKeys from 'camelcase-keys';

export const convertToCamelCase = (obj: any): any => {
  return camelcaseKeys(obj, { deep: true });
};
