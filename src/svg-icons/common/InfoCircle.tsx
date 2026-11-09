import Svg, { Circle, Path } from 'react-native-svg';
import { IconProps } from '../../types';

export const InfoCircleIcon = ({ stroke = '#858585', strokeWidth = 2 }: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth={strokeWidth} />
      <Path d="M12 11V16.5" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Circle cx="12" cy="7.75" r="1.25" fill={stroke} />
    </Svg>
  );
};
