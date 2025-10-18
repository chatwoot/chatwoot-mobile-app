/**
 * Unified Color System
 *
 * This file contains the unified color definitions that match the web application's
 * dark mode implementation exactly, ensuring visual consistency across platforms.
 */

// Color scale interface for 12-step scales (matching web app)
export interface ColorScale1to12 {
  1: string; // Darkest
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string; // Lightest
}

// Unified color scale interface
export interface UnifiedColorScale {
  slate: ColorScale1to12;
  iris: ColorScale1to12;
  blue: ColorScale1to12;
  ruby: ColorScale1to12;
  amber: ColorScale1to12;
  teal: ColorScale1to12;
  gray: ColorScale1to12;
}

// Dark mode color scales (matching web app CSS variables EXACTLY from woot.scss)
export const darkModeColorScales: UnifiedColorScale = {
  slate: {
    1: 'rgb(17, 17, 19)', // --slate-1: 17 17 19
    2: 'rgb(24, 25, 27)', // --slate-2: 24 25 27
    3: 'rgb(33, 34, 37)', // --slate-3: 33 34 37
    4: 'rgb(39, 42, 45)', // --slate-4: 39 42 45
    5: 'rgb(46, 49, 53)', // --slate-5: 46 49 53
    6: 'rgb(54, 58, 63)', // --slate-6: 54 58 63
    7: 'rgb(67, 72, 78)', // --slate-7: 67 72 78
    8: 'rgb(90, 97, 105)', // --slate-8: 90 97 105
    9: 'rgb(105, 110, 119)', // --slate-9: 105 110 119
    10: 'rgb(119, 123, 132)', // --slate-10: 119 123 132
    11: 'rgb(176, 180, 186)', // --slate-11: 176 180 186
    12: 'rgb(237, 238, 240)', // --slate-12: 237 238 240
  },
  iris: {
    1: 'rgb(19, 19, 30)', // --iris-1: 19 19 30
    2: 'rgb(23, 22, 37)', // --iris-2: 23 22 37
    3: 'rgb(32, 34, 72)', // --iris-3: 32 34 72
    4: 'rgb(38, 42, 101)', // --iris-4: 38 42 101
    5: 'rgb(48, 51, 116)', // --iris-5: 48 51 116
    6: 'rgb(61, 62, 130)', // --iris-6: 61 62 130
    7: 'rgb(74, 74, 149)', // --iris-7: 74 74 149
    8: 'rgb(89, 88, 177)', // --iris-8: 89 88 177
    9: 'rgb(91, 91, 214)', // --iris-9: 91 91 214 (primary brand)
    10: 'rgb(84, 114, 228)', // --iris-10: 84 114 228
    11: 'rgb(158, 177, 255)', // --iris-11: 158 177 255
    12: 'rgb(224, 223, 254)', // --iris-12: 224 223 254
  },
  blue: {
    1: 'rgb(17, 17, 19)', // Using slate colors for blue (not defined separately in web)
    2: 'rgb(24, 25, 27)',
    3: 'rgb(33, 34, 37)',
    4: 'rgb(39, 42, 45)',
    5: 'rgb(46, 49, 53)',
    6: 'rgb(54, 58, 63)',
    7: 'rgb(67, 72, 78)',
    8: 'rgb(90, 97, 105)',
    9: 'rgb(126, 182, 255)', // --text-blue: 126 182 255
    10: 'rgb(126, 182, 255)',
    11: 'rgb(126, 182, 255)',
    12: 'rgb(126, 182, 255)',
  },
  ruby: {
    1: 'rgb(25, 17, 19)', // --ruby-1: 25 17 19
    2: 'rgb(30, 21, 23)', // --ruby-2: 30 21 23
    3: 'rgb(58, 20, 30)', // --ruby-3: 58 20 30
    4: 'rgb(78, 19, 37)', // --ruby-4: 78 19 37
    5: 'rgb(94, 26, 46)', // --ruby-5: 94 26 46
    6: 'rgb(111, 37, 57)', // --ruby-6: 111 37 57
    7: 'rgb(136, 52, 71)', // --ruby-7: 136 52 71
    8: 'rgb(179, 68, 90)', // --ruby-8: 179 68 90
    9: 'rgb(229, 70, 102)', // --ruby-9: 229 70 102
    10: 'rgb(236, 90, 114)', // --ruby-10: 236 90 114
    11: 'rgb(255, 148, 157)', // --ruby-11: 255 148 157
    12: 'rgb(254, 210, 225)', // --ruby-12: 254 210 225
  },
  amber: {
    1: 'rgb(22, 18, 12)', // --amber-1: 22 18 12
    2: 'rgb(29, 24, 15)', // --amber-2: 29 24 15
    3: 'rgb(48, 32, 8)', // --amber-3: 48 32 8
    4: 'rgb(63, 39, 0)', // --amber-4: 63 39 0
    5: 'rgb(77, 48, 0)', // --amber-5: 77 48 0
    6: 'rgb(92, 61, 5)', // --amber-6: 92 61 5
    7: 'rgb(113, 79, 25)', // --amber-7: 113 79 25
    8: 'rgb(143, 100, 36)', // --amber-8: 143 100 36
    9: 'rgb(255, 197, 61)', // --amber-9: 255 197 61
    10: 'rgb(255, 214, 10)', // --amber-10: 255 214 10
    11: 'rgb(255, 202, 22)', // --amber-11: 255 202 22
    12: 'rgb(255, 231, 179)', // --amber-12: 255 231 179
  },
  teal: {
    1: 'rgb(13, 21, 20)', // --teal-1: 13 21 20
    2: 'rgb(17, 28, 27)', // --teal-2: 17 28 27
    3: 'rgb(13, 45, 42)', // --teal-3: 13 45 42
    4: 'rgb(2, 59, 55)', // --teal-4: 2 59 55
    5: 'rgb(8, 72, 67)', // --teal-5: 8 72 67
    6: 'rgb(20, 87, 80)', // --teal-6: 20 87 80
    7: 'rgb(28, 105, 97)', // --teal-7: 28 105 97
    8: 'rgb(32, 126, 115)', // --teal-8: 32 126 115
    9: 'rgb(18, 165, 148)', // --teal-9: 18 165 148
    10: 'rgb(14, 179, 158)', // --teal-10: 14 179 158
    11: 'rgb(11, 216, 182)', // --teal-11: 11 216 182
    12: 'rgb(173, 240, 221)', // --teal-12: 173 240 221
  },
  gray: {
    1: 'rgb(17, 17, 17)', // --gray-1: 17 17 17
    2: 'rgb(25, 25, 25)', // --gray-2: 25 25 25
    3: 'rgb(34, 34, 34)', // --gray-3: 34 34 34
    4: 'rgb(42, 42, 42)', // --gray-4: 42 42 42
    5: 'rgb(49, 49, 49)', // --gray-5: 49 49 49
    6: 'rgb(58, 58, 58)', // --gray-6: 58 58 58
    7: 'rgb(72, 72, 72)', // --gray-7: 72 72 72
    8: 'rgb(96, 96, 96)', // --gray-8: 96 96 96
    9: 'rgb(110, 110, 110)', // --gray-9: 110 110 110
    10: 'rgb(123, 123, 123)', // --gray-10: 123 123 123
    11: 'rgb(180, 180, 180)', // --gray-11: 180 180 180
    12: 'rgb(238, 238, 238)', // --gray-12: 238 238 238
  },
};

// Light mode color scales (for future implementation)
export const lightModeColorScales: UnifiedColorScale = {
  slate: {
    1: 'rgb(255, 255, 255)', // Lightest
    2: 'rgb(248, 250, 252)', // Very light
    3: 'rgb(241, 245, 249)', // Light
    4: 'rgb(226, 232, 240)', // Medium light
    5: 'rgb(203, 213, 225)', // Medium
    6: 'rgb(148, 163, 184)', // Medium dark
    7: 'rgb(100, 116, 139)', // Dark
    8: 'rgb(71, 85, 105)', // Darker
    9: 'rgb(51, 65, 85)', // Very dark
    10: 'rgb(30, 41, 59)', // Darker
    11: 'rgb(15, 23, 42)', // Very dark
    12: 'rgb(2, 6, 23)', // Darkest
  },
  iris: {
    1: 'rgb(255, 255, 255)', // Lightest
    2: 'rgb(252, 252, 255)', // Very light
    3: 'rgb(248, 249, 255)', // Light
    4: 'rgb(240, 241, 255)', // Medium light
    5: 'rgb(224, 226, 255)', // Medium
    6: 'rgb(200, 203, 255)', // Medium dark
    7: 'rgb(170, 175, 255)', // Dark
    8: 'rgb(139, 146, 255)', // Darker
    9: 'rgb(89, 88, 177)', // Primary brand
    10: 'rgb(67, 56, 202)', // Very dark
    11: 'rgb(55, 48, 163)', // Darker
    12: 'rgb(30, 27, 75)', // Darkest
  },
  blue: {
    1: 'rgb(255, 255, 255)', // Lightest
    2: 'rgb(254, 254, 255)', // Very light
    3: 'rgb(252, 253, 255)', // Light
    4: 'rgb(248, 250, 255)', // Medium light
    5: 'rgb(239, 246, 255)', // Medium
    6: 'rgb(219, 234, 254)', // Medium dark
    7: 'rgb(191, 219, 254)', // Dark
    8: 'rgb(147, 197, 253)', // Darker
    9: 'rgb(59, 130, 246)', // Primary
    10: 'rgb(37, 99, 235)', // Very dark
    11: 'rgb(29, 78, 216)', // Darker
    12: 'rgb(30, 64, 175)', // Darkest
  },
  ruby: {
    1: 'rgb(255, 255, 255)', // Lightest
    2: 'rgb(254, 254, 255)', // Very light
    3: 'rgb(252, 252, 255)', // Light
    4: 'rgb(248, 248, 255)', // Medium light
    5: 'rgb(239, 239, 255)', // Medium
    6: 'rgb(219, 219, 255)', // Medium dark
    7: 'rgb(191, 191, 255)', // Dark
    8: 'rgb(147, 147, 255)', // Darker
    9: 'rgb(220, 38, 127)', // Primary
    10: 'rgb(190, 18, 60)', // Very dark
    11: 'rgb(159, 18, 57)', // Darker
    12: 'rgb(127, 29, 29)', // Darkest
  },
  amber: {
    1: 'rgb(255, 255, 255)', // Lightest
    2: 'rgb(254, 254, 255)', // Very light
    3: 'rgb(252, 252, 255)', // Light
    4: 'rgb(248, 248, 255)', // Medium light
    5: 'rgb(239, 239, 255)', // Medium
    6: 'rgb(219, 219, 255)', // Medium dark
    7: 'rgb(191, 191, 255)', // Dark
    8: 'rgb(147, 147, 255)', // Darker
    9: 'rgb(245, 158, 11)', // Primary
    10: 'rgb(217, 119, 6)', // Very dark
    11: 'rgb(180, 83, 9)', // Darker
    12: 'rgb(146, 64, 14)', // Darkest
  },
  teal: {
    1: 'rgb(255, 255, 255)', // Lightest
    2: 'rgb(254, 254, 255)', // Very light
    3: 'rgb(252, 252, 255)', // Light
    4: 'rgb(248, 248, 255)', // Medium light
    5: 'rgb(239, 239, 255)', // Medium
    6: 'rgb(219, 219, 255)', // Medium dark
    7: 'rgb(191, 191, 255)', // Dark
    8: 'rgb(147, 147, 255)', // Darker
    9: 'rgb(20, 184, 166)', // Primary
    10: 'rgb(13, 148, 136)', // Very dark
    11: 'rgb(15, 118, 110)', // Darker
    12: 'rgb(19, 78, 74)', // Darkest
  },
  gray: {
    1: 'rgb(255, 255, 255)', // Lightest
    2: 'rgb(248, 250, 252)', // Very light
    3: 'rgb(241, 245, 249)', // Light
    4: 'rgb(226, 232, 240)', // Medium light
    5: 'rgb(203, 213, 225)', // Medium
    6: 'rgb(148, 163, 184)', // Medium dark
    7: 'rgb(100, 116, 139)', // Dark
    8: 'rgb(71, 85, 105)', // Darker
    9: 'rgb(51, 65, 85)', // Very dark
    10: 'rgb(30, 41, 59)', // Darker
    11: 'rgb(15, 23, 42)', // Very dark
    12: 'rgb(2, 6, 23)', // Darkest
  },
};
