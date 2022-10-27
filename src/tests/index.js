import React from 'react';
import PropTypes from 'prop-types';
import { NavigationContainer } from '@react-navigation/native';
import { render } from '@testing-library/react-native';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import * as eva from '@eva-design/eva';
import { theme } from 'src/theme';
import { LightTheme } from 'src/theme.v2';

const propTypes = {
  children: PropTypes.node.isRequired,
};

const AllTheProviders = ({ children }) => {
  return (
    <React.Fragment>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={theme}>
        <NavigationContainer theme={LightTheme}>{children}</NavigationContainer>
      </ApplicationProvider>
    </React.Fragment>
  );
};
AllTheProviders.propTypes = propTypes;

const customRender = (ui, options) => render(ui, { wrapper: AllTheProviders, ...options });

export { customRender as render };
