/* eslint-disable @typescript-eslint/no-var-requires */
const defaultTheme = require('tailwindcss/defaultTheme');

const radixUILightColors = require('./colors/light');
const radixUIDarkColors = require('./colors/dark');

const blackA = require('./colors/blackA');
const whiteA = require('./colors/whiteA');

const chatwootAppColors = {
  ...blackA,
  ...whiteA,
  ...radixUILightColors,
  ...radixUIDarkColors,
};

export const twConfig = {
  theme: {
    ...defaultTheme,
    extend: {
      colors: { ...chatwootAppColors },
      fontSize: {
        xs: '12px',
        cxs: '13px',
        md: '15px',
      },
      fontFamily: {
        'inter-normal-20': ['Inter-400-20'],
        'inter-420-20': ['Inter-420-20'],
        'inter-medium-24': ['Inter-500-24'],
        'inter-580-24': ['Inter-580-24'],
        'inter-semibold-20': ['Inter-600-20'],
      },
    },
  },
  plugins: [],
};
