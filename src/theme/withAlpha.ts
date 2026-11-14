// twrnc ignores /opacity on hsl.
export const withAlpha = (colour: string, alpha: number) =>
  colour.replace(/^hsl\((.*)\)$/, `hsla($1, ${alpha})`);
