import React from 'react';
import { screen } from '@testing-library/react-native';
import { render } from 'tests';
import UserAvatar from './UserAvatar';

jest.mock('react-native-linear-gradient', () => 'LinearGradient');
jest.mock('react-native-fast-image', () => 'FastImage');

describe('UserAvatar', () => {
  it('should render the user avatar', () => {
    render(<UserAvatar userName="John Doe" />);
    expect(screen.getByText('JD')).toBeTruthy();
  });
  // it('should render the availability status', () => {
  //   render(<UserAvatar availabilityStatus="online" />);
  //   expect(screen.getByTestId('userAvatarBadge')).toHaveStyle({ backgroundColor: '#44ce4b' });
  // });
  // it('should render the user avatar with URL', () => {
  //   render(
  //     <UserAvatar thumbnail="https://randomuser.me/api/portraits/men/18.jpg" userName="John Doe" />,
  //   );
  //   expect(screen.getByTestId('userAvatar')).toBeTruthy();
  // });
});
