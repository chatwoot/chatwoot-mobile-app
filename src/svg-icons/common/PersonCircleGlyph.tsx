import Svg, { Circle, Path } from 'react-native-svg';

import { IconProps } from '../../types';

export const PersonCircleGlyph = ({
  stroke = '#1F93FF',
  strokeWidth = 1.6,
}: IconProps): JSX.Element => (
  <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth={strokeWidth} />
    <Circle cx="12" cy="10" r="3" stroke={stroke} strokeWidth={strokeWidth} />
    <Path
      d="M6.6 18.2C7.7 16.35 9.7 15.25 12 15.25C14.3 15.25 16.3 16.35 17.4 18.2"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);
