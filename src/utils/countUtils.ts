export const formatCount = (count: number) => count.toLocaleString();

export const formatPluralCount = (count: number, singular: string, plural = `${singular}s`) =>
  `${formatCount(count)} ${count === 1 ? singular : plural}`;
