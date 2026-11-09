import Svg, { Circle, Path } from 'react-native-svg';

import { IconProps } from '../../types';

export const TagGlyph = ({ stroke = '#1F93FF', strokeWidth = 1.6 }: IconProps): JSX.Element => (
  <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
    <Path
      d="M3.75 12.06V4.75C3.75 4.2 4.2 3.75 4.75 3.75H12.06C12.33 3.75 12.58 3.86 12.77 4.04L20.1 11.37C20.49 11.76 20.49 12.4 20.1 12.79L12.79 20.1C12.4 20.49 11.76 20.49 11.37 20.1L4.04 12.77C3.86 12.58 3.75 12.33 3.75 12.06Z"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    <Circle cx="8.25" cy="8.25" r="1.35" fill={stroke} />
  </Svg>
);
