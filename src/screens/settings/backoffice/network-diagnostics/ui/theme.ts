export const colors = {
  bg: '#0B1020',
  surface: '#121A2C',
  sheet: '#0F1626',
  menu: '#1B2438',
  border: 'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.1)',
  text: '#F2F5FB',
  textDim: '#9AA4B8',
  textMuted: '#6B7488',
  eyebrow: '#5C6680',
  brand: '#4B8DF8',
  amber: '#F2A93B',
  red: '#F0524D',
  green: '#2BD46A',
};

export type Tone = 'brand' | 'warning' | 'danger' | 'info' | 'success' | 'churn' | 'neutral';

export function tone(name: Tone): string {
  switch (name) {
    case 'brand': return colors.brand;
    case 'warning': return colors.amber;
    case 'danger': return colors.red;
    case 'info': return colors.brand;
    case 'success': return colors.green;
    case 'churn': return colors.red;
    default: return colors.textDim;
  }
}
