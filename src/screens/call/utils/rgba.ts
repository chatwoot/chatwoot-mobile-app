// Colour parsing rejects exponent-form alpha values.
export const rgba = (rgb: string, alpha: number) => {
  'worklet';
  return `rgba(${rgb}, ${Math.round(Math.max(0, Math.min(1, alpha)) * 1000) / 1000})`;
};
