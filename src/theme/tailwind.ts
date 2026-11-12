import { create } from 'twrnc';

import { twConfig } from './tailwind.config';
import { useSystemFont } from './appFont';

const tw = create(twConfig);

// Explicit tracking disables iOS kerning.
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
