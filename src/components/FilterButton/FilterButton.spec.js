import React from 'react';
import { screen } from '@testing-library/react-native';
import { render } from 'tests';
import FilterButton from './FilterButton';

jest.mock('react-native-linear-gradient', () => 'LinearGradient');

describe('FilterButton', () => {
  it('should render without active view', () => {
    render(<FilterButton label="Inbox" />);
    expect(screen.getByText('Inbox')).toBeTruthy();
  });
  it('should render with  active view', () => {
    render(<FilterButton label="Inbox" isActive={true} />);
    expect(screen.getByText('Inbox')).toBeTruthy();
  });
  it('should render without the left icon', () => {
    render(<FilterButton label="Inbox" isActive={false} />);
    expect(screen.getByText('Inbox')).toBeTruthy();
  });
  it('should render with the left icon', () => {
    render(
      <FilterButton
        label="Inbox"
        isActive={false}
        hasLeftIcon={true}
        leftIconName="inbox-outline"
      />,
    );
    expect(screen.getByLabelText('inbox-outline')).toBeTruthy();
  });
});
