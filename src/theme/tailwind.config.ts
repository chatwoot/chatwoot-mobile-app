/* eslint-disable @typescript-eslint/no-require-imports */
const defaultTheme = require('tailwindcss/defaultTheme');

// Import unified color system
const { darkModeColorScales, lightModeColorScales } = require('./colors/unified');
const { darkSemanticColors, lightSemanticColors } = require('./colors/semantic');

// Legacy color support (for backward compatibility)
const radixUILightColors = require('./colors/light');
const radixUIDarkColors = require('./colors/dark');
const blackA = require('./colors/blackA');
const whiteA = require('./colors/whiteA');

// Combined color system (unified + legacy)
const chatwootAppColors = {
  // Legacy colors for backward compatibility
  ...blackA,
  ...whiteA,
  ...radixUILightColors,
  ...radixUIDarkColors,
  
  // Unified color system
  ...darkModeColorScales,
  ...lightModeColorScales,
  
  // Semantic colors
  ...darkSemanticColors,
  ...lightSemanticColors,
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
