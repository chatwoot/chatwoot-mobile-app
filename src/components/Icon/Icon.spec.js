import React from 'react';
import { screen } from '@testing-library/react-native';
import { render } from 'tests';
import Icon from './Icon';

describe('Icon', () => {
  it('should render the icon', () => {
    render(<Icon icon="search" />);
    expect(screen.getByLabelText('search')).toBeTruthy();
  });
  // it('should render the icon with size', () => {
  //   render(<Icon icon="search" size={24} />);
  //   expect(screen.getByLabelText('search')).toHaveStyle({ width: 24, height: 24 });
  // });
  // it('should render the icon with color', () => {
  //   render(<Icon icon="camera-outline" color="red" />);
  //   expect(screen.getByLabelText('camera-outline')).toHaveProp('fill', 'red');
  // });
  // it('should render the icon with primary color if no color is provided', () => {
  //   render(<Icon icon="search" />);
  //   expect(screen.getByLabelText('search')).toHaveProp('fill', '#1F93FF');
  // });
});
