// twrnc drops the /opacity modifier on the palette's hsl colours
export const withAlpha = (colour: string, alpha: number) =>
  colour.replace(/^hsl\((.*)\)$/, `hsla($1, ${alpha})`);
