import React from 'react';
import { screen } from '@testing-library/react-native';
import { render } from 'tests';
import Header from './Header';
jest.mock('react-native-linear-gradient', () => 'LinearGradient');

describe('Header', () => {
  it('should render the header with text', () => {
    render(<Header headerText="Conversation" />);
    expect(screen.getByText('Conversation')).toBeTruthy();
  });
  // it('should render the header with left icon and text', () => {
  //   render(<Header headerText="Conversation" leftIcon="arrow-back-outline" />);
  //   expect(screen.getByText('Conversation')).toBeTruthy();
  //   expect(screen.getByLabelText('arrow-back-outline')).toBeTruthy();
  // });
  // it('should render the header with left icon', () => {
  //   render(<Header leftIcon="arrow-back-outline" />);
  //   expect(screen.getByLabelText('arrow-back-outline')).toBeTruthy();
  // });
  // it('should render the header with right icon', () => {
  //   render(<Header rightIcon="more-vertical-outline" />);
  //   expect(screen.getByLabelText('more-vertical-outline')).toBeTruthy();
  // });
  // it('should render the header with loader', () => {
  //   render(<Header headerText="Updating" loading />);
  //   expect(screen.getByText('Updating')).toBeTruthy();
  // });
});
