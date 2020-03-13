import { light } from '@eva-design/eva';

export const theme = {
  ...light,

  'color-primary-100': '#D2F2FF',
  'color-primary-200': '#A5E1FF',
  'color-primary-300': '#78CCFF',
  'color-primary-400': '#57B6FF',
  'color-primary-500': '#1F93FF',
  'color-primary-600': '#1672DB',
  'color-primary-700': '#0F55B7',
  'color-primary-800': '#093B93',
  'color-primary-900': '#052A7A',
  'color-primary-transparent-100': 'rgba(31, 147, 255, 0.08)',
  'color-primary-transparent-200': 'rgba(31, 147, 255, 0.16)',
  'color-primary-transparent-300': 'rgba(31, 147, 255, 0.24)',
  'color-primary-transparent-400': 'rgba(31, 147, 255, 0.32)',
  'color-primary-transparent-500': 'rgba(31, 147, 255, 0.4)',
  'color-primary-transparent-600': 'rgba(31, 147, 255, 0.48)',
  'color-success-100': '#CEFCD0',
  'color-success-200': '#9FFAAC',
  'color-success-300': '#6DF08D',
  'color-success-400': '#48E17C',
  'color-success-500': '#13ce66',
  'color-success-600': '#0DB166',
  'color-success-700': '#099462',
  'color-success-800': '#06775A',
  'color-success-900': '#036253',
  'color-success-transparent-100': 'rgba(19, 206, 102, 0.08)',
  'color-success-transparent-200': 'rgba(19, 206, 102, 0.16)',
  'color-success-transparent-300': 'rgba(19, 206, 102, 0.24)',
  'color-success-transparent-400': 'rgba(19, 206, 102, 0.32)',
  'color-success-transparent-500': 'rgba(19, 206, 102, 0.4)',
  'color-success-transparent-600': 'rgba(19, 206, 102, 0.48)',
  'color-info-100': '#CDEDFF',
  'color-info-200': '#9BD8FF',
  'color-info-300': '#6ABDFF',
  'color-info-400': '#45A4FF',
  'color-info-500': '#077BFF',
  'color-info-600': '#055FDB',
  'color-info-700': '#0346B7',
  'color-info-800': '#023193',
  'color-info-900': '#01237A',
  'color-info-transparent-100': 'rgba(7, 123, 255, 0.08)',
  'color-info-transparent-200': 'rgba(7, 123, 255, 0.16)',
  'color-info-transparent-300': 'rgba(7, 123, 255, 0.24)',
  'color-info-transparent-400': 'rgba(7, 123, 255, 0.32)',
  'color-info-transparent-500': 'rgba(7, 123, 255, 0.4)',
  'color-info-transparent-600': 'rgba(7, 123, 255, 0.48)',
  'color-warning-100': '#FFF8D6',
  'color-warning-200': '#FFEEAD',
  'color-warning-300': '#FFE383',
  'color-warning-400': '#FFD765',
  'color-warning-500': '#FFC532',
  'color-warning-600': '#DBA224',
  'color-warning-700': '#B78119',
  'color-warning-800': '#93630F',
  'color-warning-900': '#7A4D09',
  'color-warning-transparent-100': 'rgba(255, 197, 50, 0.08)',
  'color-warning-transparent-200': 'rgba(255, 197, 50, 0.16)',
  'color-warning-transparent-300': 'rgba(255, 197, 50, 0.24)',
  'color-warning-transparent-400': 'rgba(255, 197, 50, 0.32)',
  'color-warning-transparent-500': 'rgba(255, 197, 50, 0.4)',
  'color-warning-transparent-600': 'rgba(255, 197, 50, 0.48)',
  'color-danger-100': '#FFE7D5',
  'color-danger-200': '#FFC9AC',
  'color-danger-300': '#FFA582',
  'color-danger-400': '#FF8263',
  'color-danger-500': '#FF4830',
  'color-danger-600': '#DB2923',
  'color-danger-700': '#B7181F',
  'color-danger-800': '#930F1F',
  'color-danger-900': '#ed2f2f',
  'color-danger-transparent-100': 'rgba(255, 72, 48, 0.08)',
  'color-danger-transparent-200': 'rgba(255, 72, 48, 0.16)',
  'color-danger-transparent-300': 'rgba(255, 72, 48, 0.24)',
  'color-danger-transparent-400': 'rgba(255, 72, 48, 0.32)',
  'color-danger-transparent-500': 'rgba(255, 72, 48, 0.4)',
  'color-danger-transparent-600': 'rgba(255, 72, 48, 0.48)',

  // In Eva, we can use `background-basic-color-1` for backgrounds.
  // In case there is a need to display a white text on a colorful backgrounds,
  // `text-control-color` may be used.
  // Also, if you use UI Kitten components for displaying on colorful backgrounds,
  // You may use `status='control'
  // 'loader-color': '#ffff',

  // Instead of creating a custom theme variable, we may use registered `color-primary-default`
  // 'color-primary': '#1F93FF',

  // Instead of creating a custom theme variable, we may use registered `color-success-default`
  // To do this, let's generate a valid palette for this color by using https://colors.eva.design
  // By making #13ce66 used for -500 shade
  // 'color-success': '#13ce66',

  'color-basic-transparent-300': '$color-primary-500',

  // Instead of creating a custom theme variable,
  // we may use registered basic- shades and it's references
  // This variable is used in chat item date, where it makes sense to use `text-hint-color`
  // 'color-gray': '#6E6F73',

  // Think how you can get rid of this group of variables
  // by creating basic palette (just like with the case of color-primary-* variables)
  // https://akveo.github.io/react-native-ui-kitten/docs/guides/branding#branding
  'color-light-gray': '#d3d3d3',
  'color-border': '#f0f4f5',
  'color-border-light': '#f0f4f5',
  'color-background': '#EFF2F7',
  'color-background-light': '#F9FAFC',
  'color-background-message': '#c7e3ff',
  'color-background-activity': '#fff3cf',

  // In this app, in most cases it is used for backgrounds
  // In Eva, we can use `background-basic-color-1` for backgrounds.
  // In case there is a need to display a white text on a colorful backgrounds,
  // `text-control-color` may be used.
  // Also, if you use UI Kitten components for displaying on colorful backgrounds,
  // You may use `status='control'
  // 'color-white': '#FFF',
  'color-body': '#3C4858',
  'color-heading': '#1F2D3D',
  'back-drop-color': 'rgba(0, 0, 0, 0.5)',

  // Text color
  // Instead of creating a custom theme variable, we may use registered `text-basic-color`
  // Which stands for `every text in app`.
  // 'text-basic-color': '#6e6f73',
  // 'text-primary-color': '#6e6f73',

  'text-active-color': '#1f2d3d',
  'text-primary-size': 14,
  'text-button-size': 18,

  // Header
  // 'header-text-color': '#1f2d3d',

  // Tab
  // Instead of creating a custom theme variable, we may use registered `text-hint-color`
  // Tabs, checkboxes etc in non-active state refer to hint colors.
  // Also, if you use UI Kitten Text for displaying a hint,
  // You may use `appearance='hint'`
  // 'tab-not-active-color': '#8492a6',
  'text-hint-color': '#8492a6',

  // Input
  'input-border-color': '#c0ccda',

  // Button
  // In this app, this was used on login screens to display a button with look
  // like it has no background
  // You may use `appearance='ghost'` + status='basic'` for this.
  // 'button-color': '#fff',
  'button-font-size': 18,

  // Think if you can combine fontSize, fontWeight and fontFamily properties
  // to bring more consistency in your app.
  // E.g fontWeight is 400, fontSize should be 18, etc.
  // Just like it works in CustomText component by choosing a family for a given weight.

  // Font Weight
  'font-thin': '100',
  'font-ultra-light': '200',
  'font-light': '300',
  'font-regular': '400',
  'font-medium': '500',
  'font-semi-bold': '600',
  'font-bold': '700',

  // Font size
  'font-size-extra-large': 20,
  'font-size-large': 18,
  'font-size-medium': 16,
  'font-size-small': 14,
  'font-size-extra-small': 12,
  'font-size-extra-extra-small': 10,
};
