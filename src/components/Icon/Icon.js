import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import icons from 'constants/fluent-icons.json';
import PropTypes from 'prop-types';

const propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  type: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.string,
  color: PropTypes.string,
};
const defaultProps = {
  size: 22,
  color: '#1F93FF',
};

const getPathSource = ({ icon }) => {
  const path = icons[`${icon}`];
  return path;
};

const Icon = ({ size, icon, color }) => {
  const path = getPathSource({ icon });
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden="true"
      width={size}
      height={size}
      accessibilityLabel={icon}>
      <Path key={path} d={path} fill={color} />
    </Svg>
  );
};
Icon.propTypes = propTypes;
Icon.defaultProps = defaultProps;

export default Icon;
