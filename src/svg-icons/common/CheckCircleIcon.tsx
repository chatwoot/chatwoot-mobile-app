import Svg, { Circle, Path } from 'react-native-svg';
import { IconProps } from '../../types';

export const CheckCircleIcon = ({
  stroke = '#858585',
  strokeWidth = 2,
}: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth={strokeWidth} />
      <Path
        d="M8.25 12.25L10.75 14.75L15.75 9.5"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
