import { create } from 'twrnc';

import { twConfig } from './tailwind.config';

export const tailwind = create(twConfig);

// twrnc's `color()` does not understand the `dark:` prefix, so resolve the scheme here:
// `tailwind.color('text-gray-950 dark:text-grayDark-950')` returns the colour for the active scheme.
const resolveColor = tailwind.color;
const getColorScheme = (tailwind as unknown as { getColorScheme: () => string | null | undefined })
  .getColorScheme;

tailwind.color = (utils: string) => {
  const tokens = utils.split(/\s+/g).filter(Boolean);
  const darkTokens = tokens.filter(token => token.startsWith('dark:'));
  if (darkTokens.length === 0) return resolveColor(utils);

  if (getColorScheme() === 'dark') {
    return resolveColor(darkTokens.map(token => token.slice('dark:'.length)).join(' '));
  }
  return resolveColor(tokens.filter(token => !token.startsWith('dark:')).join(' '));
};
