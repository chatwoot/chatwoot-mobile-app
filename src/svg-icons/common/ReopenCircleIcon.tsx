import Svg, { Path } from 'react-native-svg';
import { IconProps } from '../../types';

export const ReopenCircleIcon = ({
  stroke = '#858585',
  strokeWidth = 2,
}: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.25 12C20.25 16.56 16.56 20.25 12 20.25C7.44 20.25 3.75 16.56 3.75 12C3.75 7.44 7.44 3.75 12 3.75C14.6 3.75 16.9 4.95 18.4 6.83"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M18.75 3.5V7.25H15"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
