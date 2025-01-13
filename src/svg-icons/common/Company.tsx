import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const CompanyIcon = (): JSX.Element => {
  return (
    <Svg width="22" height="20" viewBox="0 0 22 20" fill="none">
      <Path
        d="M11 11H11.01M15 5V3C15 2.46957 14.7893 1.96086 14.4142 1.58579C14.0391 1.21071 13.5304 1 13 1H9C8.46957 1 7.96086 1.21071 7.58579 1.58579C7.21071 1.96086 7 2.46957 7 3V5M21 12C18.0328 13.959 14.5555 15.0033 11 15.0033C7.44445 15.0033 3.96721 13.959 1 12M3 5H19C20.1046 5 21 5.89543 21 7V17C21 18.1046 20.1046 19 19 19H3C1.89543 19 1 18.1046 1 17V7C1 5.89543 1.89543 5 3 5Z"
        stroke="#838383"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
