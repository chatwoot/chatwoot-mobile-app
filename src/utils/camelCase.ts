/* eslint-disable @typescript-eslint/no-explicit-any */
import camelcaseKeys from 'camelcase-keys';

export const camelCase = (data: any, options: any) => {
  return camelcaseKeys(data, options);
};
