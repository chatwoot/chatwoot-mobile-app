import { create } from 'twrnc';

import { twConfig } from './tailwind.config';

type AppColorScheme = 'light' | 'dark';

const baseTailwind = create(twConfig);
const baseStyle = baseTailwind.style.bind(baseTailwind);
const baseColor = baseTailwind.color.bind(baseTailwind);

let currentColorScheme: AppColorScheme = 'light';

const darkClassReplacements: Record<string, string> = {
  'bg-white': 'bg-grayDark-50',
  'bg-gray-50': 'bg-grayDark-100',
  'bg-gray-100': 'bg-grayDark-200',
  'bg-gray-200': 'bg-grayDark-300',
  'bg-gray-300': 'bg-grayDark-400',
  'bg-gray-400': 'bg-grayDark-500',
  'bg-gray-700': 'bg-grayDark-700',
  'bg-amber-100': 'bg-amberDark-200',
  'bg-amber-200': 'bg-amberDark-300',
  'bg-amber-700': 'bg-amberDark-700',
  'bg-blue-100': 'bg-blueDark-200',
  'bg-blue-700': 'bg-blueDark-600',
  'bg-blue-800': 'bg-blueDark-800',
  'bg-indigo-100': 'bg-indigoDark-200',
  'bg-indigo-200': 'bg-indigoDark-300',
  'bg-indigo-700': 'bg-indigoDark-700',
  'bg-green-100': 'bg-greenDark-200',
  'bg-green-200': 'bg-greenDark-300',
  'bg-green-700': 'bg-greenDark-700',
  'bg-blackA-A3': 'bg-whiteA-A3',
  'bg-blackA-A4': 'bg-whiteA-A3',
  'bg-blackA-A6': 'bg-whiteA-A6',
  'bg-[#00000009]': 'bg-[#FFFFFF0D]',
  'border-white': 'border-grayDark-50',
  'border-b-blackA-A3': 'border-b-whiteA-A3',
  'border-t-blackA-A3': 'border-t-whiteA-A3',
  'border-blackA-A3': 'border-whiteA-A3',
  'border-blackA-A6': 'border-whiteA-A6',
  'border-amber-700': 'border-amberDark-700',
  'border-gray-100': 'border-grayDark-300',
  'border-gray-200': 'border-grayDark-300',
  'border-t-gray-200': 'border-t-grayDark-300',
  'border-b-gray-200': 'border-b-grayDark-300',
  'border-gray-300': 'border-grayDark-400',
  'border-b-gray-300': 'border-b-grayDark-400',
  'text-gray-500': 'text-grayDark-700',
  'text-gray-600': 'text-grayDark-700',
  'text-gray-700': 'text-grayDark-800',
  'text-gray-800': 'text-grayDark-900',
  'text-gray-900': 'text-grayDark-900',
  'text-gray-950': 'text-grayDark-950',
  'text-blue-700': 'text-blueDark-900',
  'text-blue-800': 'text-blueDark-900',
  'text-amber-950': 'text-amberDark-950',
  'text-blackA-A3': 'text-whiteA-A3',
  'text-blackA-A10': 'text-whiteA-A10',
  'text-blackA-A11': 'text-whiteA-A11',
  'text-blackA-A12': 'text-whiteA-A12',
};

const transformClassToken = (token: string) => {
  if (!token) {
    return token;
  }

  const importantPrefix = token.startsWith('!') ? '!' : '';
  const tokenWithoutPrefix = importantPrefix ? token.slice(1) : token;
  const tokenParts = tokenWithoutPrefix.split(':');
  const utility = tokenParts.pop();

  if (!utility) {
    return token;
  }

  const transformedUtility = darkClassReplacements[utility] || utility;
  return `${importantPrefix}${[...tokenParts, transformedUtility].join(':')}`;
};

const transformClassName = (className: string) => {
  if (currentColorScheme !== 'dark') {
    return className;
  }

  return className.split(/\s+/).map(transformClassToken).join(' ');
};

type StyleArgs = Parameters<typeof baseTailwind.style>;
type StyleArg = StyleArgs[number];

const transformStyleArg = (styleArg: StyleArg): StyleArg => {
  if (typeof styleArg === 'string') {
    return transformClassName(styleArg) as StyleArg;
  }

  if (Array.isArray(styleArg)) {
    return styleArg.map(transformStyleArg) as StyleArg;
  }

  return styleArg;
};

export const setTailwindColorScheme = (colorScheme: AppColorScheme) => {
  currentColorScheme = colorScheme;
};

export const getTailwindColorScheme = () => currentColorScheme;

export const tailwind = Object.assign(baseTailwind, {
  style: (...styleArgs: StyleArgs) => {
    return baseStyle(...(styleArgs.map(transformStyleArg) as StyleArgs));
  },
  color: (className: string) => {
    return baseColor(transformClassName(className));
  },
});
