// Formats an rgba string with the alpha clamped and rounded to three places, so a tiny
// float never prints in exponent form, which the colour parser rejects
export const rgba = (rgb: string, alpha: number) => {
  'worklet';
  return `rgba(${rgb}, ${Math.round(Math.max(0, Math.min(1, alpha)) * 1000) / 1000})`;
};
