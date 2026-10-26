/* eslint-disable @typescript-eslint/no-require-imports */
const defaultTheme = require('tailwindcss/defaultTheme');

// Light theme colors
const radixUILightColors = require('./colors/light');
// Dark theme colors
const radixUIDarkColors = require('./colors/dark');

// Black with alpha variations
const blackA = require('./colors/blackA');
// White with alpha variations
const whiteA = require('./colors/whiteA');
const { plugin } = require('twrnc');
const { appFont, useSystemFont } = require('./appFont');

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
      // We are using individual static Inter font files (e.g., Inter-400-20.ttf) to load different font weights and styles
      // Please refer to the following links for more information:
      // https://medium.com/timeless/adding-custom-variable-fonts-in-react-native-47e0d062bcfc
      // https://medium.com/timeless/adding-custom-variable-fonts-in-react-native-part-ii-d11a979a38f3
      // - Normal/Regular: "inter-normal-20" (400)
      // - Slightly heavier than Regular: "inter-420-20" (400)
      // - Medium: "inter-medium-24" (500)
      // - Between Medium and Semi-bold: "inter-580-24" (600)
      // - Semi-bold: "inter-semibold-24" (600)
      // -  Last numbers (20, 24 etc) are optical sizes.
      // On iOS (system font trial) these names map to the system font below instead.
      fontFamily: useSystemFont
        ? {}
        : {
            'inter-normal-20': ['Inter-400-20'],
            'inter-420-20': ['Inter-420-20'],
            'inter-medium-24': ['Inter-500-24'],
            'inter-580-24': ['Inter-580-24'],
            'inter-semibold-20': ['Inter-600-20'],
          },
    },
  },
  // TRIAL: on iOS the Inter class names use Apple's system font at the matching weight, so
  // no screen needs to change. See src/theme/appFont.ts to switch back.
  plugins: useSystemFont
    ? [
        plugin(
          ({ addUtilities }: { addUtilities: (utilities: Record<string, object>) => void }) => {
            addUtilities({
              'font-inter-normal-20': appFont('Inter-400-20'),
              'font-inter-420-20': appFont('Inter-420-20'),
              'font-inter-medium-24': appFont('Inter-500-24'),
              'font-inter-580-24': appFont('Inter-580-24'),
              'font-inter-semibold-20': appFont('Inter-600-20'),
            });
          },
        ),
      ]
    : [],
};
