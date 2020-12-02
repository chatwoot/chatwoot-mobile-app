import { Icon } from '@ui-kitten/components';
import PropTypes from 'prop-types';
import React from 'react';

const CustomIcon = ({ name, color, height, width, ...customProps }) => {
  return <Icon height={height} width={width} fill={color} name={name} {...customProps} />;
};

const propTypes = {
  color: PropTypes.string,
  name: PropTypes.string.isRequired,
  height: PropTypes.number,
  width: PropTypes.number,
};

const defaultProps = {
  height: 32,
  width: 32,
};

CustomIcon.propTypes = propTypes;
CustomIcon.defaultProps = defaultProps;

export default CustomIcon;
