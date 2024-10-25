import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { IconProps } from '../../types';

export const TranslateIcon = ({ stroke = '#858585' }: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Path
        d="M12.913 17H20.087M12.913 17L11 21M12.913 17L15.778 11.009C16.009 10.526 16.125 10.285 16.283 10.209C16.3507 10.1764 16.4249 10.1595 16.5 10.1595C16.5751 10.1595 16.6493 10.1764 16.717 10.209C16.875 10.285 16.991 10.526 17.222 11.009L20.087 17M20.087 17L22 21M2 5H8M8 5H11.5M8 5V3M11.5 5H14M11.5 5C11.004 7.957 9.853 10.636 8.166 12.884M8.166 12.884C8.73269 13.3248 9.34804 13.6993 10 14M8.166 12.884C6.813 11.848 5.603 10.427 5 9M8.166 12.884C6.53945 15.0485 4.42745 16.8008 2 18"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
