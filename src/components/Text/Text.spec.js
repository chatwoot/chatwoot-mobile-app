import React from 'react';
import { screen } from '@testing-library/react-native';
import { render } from 'tests';

import Text from './Text';
describe('Text', () => {
  it('should render the text correctly', () => {
    render(<Text>Test</Text>);
    expect(screen.getByText('Test')).toBeTruthy();
  });
  it('should render the text with bold', () => {
    render(
      <Text accessible={true} bold>
        Test
      </Text>,
    );
    expect(screen.getByText('Test')).toHaveStyle({ fontWeight: 'bold' });
  });
  it('should render the text with color', () => {
    render(
      <Text accessible={true} color="red">
        Test
      </Text>,
    );
    expect(screen.getByText('Test')).toHaveStyle({ color: 'red' });
  });
  it('should render the text with xxs', () => {
    render(
      <Text accessible={true} xxs>
        Test
      </Text>,
    );
    expect(screen.getByText('Test')).toHaveStyle({ fontSize: 10 });
  });
  it('should render the capitalize text', () => {
    render(
      <Text accessible={true} capitalize>
        Test
      </Text>,
    );
    expect(screen.getByText('Test')).toHaveStyle({ textTransform: 'capitalize' });
  });
  it('should render the text if custom style is passed', () => {
    render(
      <Text accessible={true} style={{ lineHeight: 20 }}>
        Test
      </Text>,
    );
    expect(screen.getByText('Test')).toHaveStyle({ lineHeight: 20 });
  });
});
