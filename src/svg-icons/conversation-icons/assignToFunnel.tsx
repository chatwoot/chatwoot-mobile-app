import Svg, { Path } from 'react-native-svg';

export const FunnelIcon = ({ color = 'white', strokeWidth = 2 }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
