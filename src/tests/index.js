import React from 'react';
import PropTypes from 'prop-types';
import { NavigationContainer } from '@react-navigation/native';
import { render } from '@testing-library/react-native';
import { LightTheme } from 'src/theme';

const propTypes = {
  children: PropTypes.node.isRequired,
};

const AllTheProviders = ({ children }) => {
  return (
    <React.Fragment>
      <NavigationContainer theme={LightTheme}>{children}</NavigationContainer>
    </React.Fragment>
  );
};
AllTheProviders.propTypes = propTypes;

const customRender = (ui, options) => render(ui, { wrapper: AllTheProviders, ...options });

export { customRender as render };
