import { create } from 'twrnc';

import { twConfig } from './tailwind.config';
import { useSystemFont } from './appFont';

const tw = create(twConfig);

// With Apple's system font (iOS trial), drop letter spacing: the system font sets its own
// tracking for each size, and on iOS any explicit value (even 0) replaces it and turns
// off kerning. The tracking-[…] classes were tuned for Inter.
if (useSystemFont) {
  const style = tw.style.bind(tw);
  tw.style = ((...args: Parameters<typeof tw.style>) => {
    const result = style(...args);
    if ('letterSpacing' in result) {
      const { letterSpacing: _letterSpacing, ...rest } = result;
      return rest;
    }
    return result;
  }) as typeof tw.style;
}

export const tailwind = tw;
