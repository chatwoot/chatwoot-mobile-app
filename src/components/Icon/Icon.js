import { Icon as EvaIcon } from '@ui-kitten/components';
import PropTypes from 'prop-types';
import React from 'react';

const Icon = ({ icon, color, size, ...customProps }) => {
  return (
    <EvaIcon
      height={size}
      width={size}
      fill={color}
      name={icon}
      {...customProps}
      accessibilityLabel={icon}
    />
  );
};

const propTypes = {
  color: PropTypes.string,
  icon: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const defaultProps = {
  size: 32,
  color: '#1F93FF',
};

Icon.propTypes = propTypes;
Icon.defaultProps = defaultProps;

export default Icon;
