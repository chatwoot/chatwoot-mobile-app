const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

const pad = (value: number) => String(value).padStart(2, '0');

export const toDateValue = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const parseDateValue = (value: unknown) => {
  if (typeof value !== 'string') return null;
  const match = DATE_PATTERN.exec(value);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
};

export const formatDateValue = (date: Date) =>
  date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
