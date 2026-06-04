const DEFAULT_COUNTRY_CODE = '1';

export const digitsOnly = (value: string) => value.replace(/\D/g, '');

export const sanitizeDialedNumber = (value: string) => digitsOnly(value);

export const normalizeDialedNumber = (value: string) => {
  const digits = digitsOnly(value);

  if (digits.length === 10) {
    return `+${DEFAULT_COUNTRY_CODE}${digits}`;
  }

  if (digits.length === 11 && digits.startsWith(DEFAULT_COUNTRY_CODE)) {
    return `+${digits}`;
  }

  return digits ? `+${digits}` : '';
};

export const isCompleteDialedNumber = (value: string) => {
  const digits = digitsOnly(value);

  return digits.length === 10 || (digits.length === 11 && digits.startsWith(DEFAULT_COUNTRY_CODE));
};

export const formatDialedNumber = (value: string) => {
  const digits = digitsOnly(value);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (digits.length === 11 && digits.startsWith(DEFAULT_COUNTRY_CODE)) {
    return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  return `+${digits}`;
};
