/* eslint-disable @typescript-eslint/no-require-imports */
import { create } from 'twrnc';
import { twConfig } from './tailwind.config';
import { tailwind } from './tailwind';
import { useSystemFont } from './appFont';
import { useAppAppearance } from './appearance';

const darkPalette: Record<string, Record<string, string>> = require('./colors/dark');
const darkColors = Object.fromEntries(
  Object.entries(darkPalette).map(([name, shades]) => [name.replace(/Dark$/, ''), shades]),
);
const dark = create({
  ...twConfig,
  theme: {
    ...twConfig.theme,
    extend: {
      ...twConfig.theme.extend,
      colors: {
        ...twConfig.theme.extend.colors,
        ...darkColors,
        gray: { ...darkColors.gray, 50: '#111113' },
        surface: '#1C1C1E',
      },
    },
  },
});

// Keep foreground white (sent messages, badges) white. Only white surfaces change.
export const darkClasses = (value: string) =>
  value
    .replace(/\bbg-white\b/g, 'bg-surface')
    .replace(/\btext-gray-(700|800)\b/g, 'text-gray-900')
    .replace(/\bbg-\[#EBEBEB\]/g, 'bg-gray-200')
    .replace(/\b(text|border(?:-[tblrxy])?)-black\b(?!A)/g, '$1-gray-950')
    .replace(/\b(text|border(?:-[tblrxy])?)-blackA-/g, '$1-whiteA-')
    .replace(/\bbg-blackA-(A[1-6])\b/g, 'bg-whiteA-$1');

const darkStyle = dark.style.bind(dark);
dark.style = ((...inputs: Parameters<typeof dark.style>) => {
  const map = (input: unknown): unknown => {
    if (typeof input === 'string') return darkClasses(input);
    if (Array.isArray(input)) return input.map(map);
    if (input && typeof input === 'object') {
      return Object.fromEntries(
        Object.entries(input).map(([key, value]) => [darkClasses(key), value]),
      );
    }
    return input;
  };
  const result = darkStyle(...(inputs.map(map) as Parameters<typeof dark.style>));
  if (useSystemFont) delete result.letterSpacing;
  return result;
}) as typeof dark.style;
const darkColor = dark.color.bind(dark);
dark.color = (color: string) => darkColor(darkClasses(color));

export type ThemeTailwind = typeof tailwind & { isDark: boolean };
const lightTailwind = Object.assign(tailwind, { isDark: false });
const darkTailwind = Object.assign(dark, { isDark: true });

export const useTailwind = (): ThemeTailwind =>
  useAppAppearance() === 'dark' ? darkTailwind : lightTailwind;
