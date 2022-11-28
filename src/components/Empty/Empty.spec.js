import React from 'react';
import { screen } from '@testing-library/react-native';
import { render } from 'tests';
import Empty from './Empty';
jest.mock('react-native-linear-gradient', () => 'LinearGradient');
describe('Empty', () => {
  it('should render the empty view with title', () => {
    render(<Empty title="There are no active conversations in this group." />);
    expect(screen.getByText('There are no active conversations in this group.')).toBeTruthy();
  });
  it('should render the empty view with subtitle', () => {
    render(<Empty subTitle="No results found" />);
    expect(screen.getByText('No results found')).toBeTruthy();
  });
});
