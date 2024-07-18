import React from 'react';
import { screen } from '@testing-library/react-native';
import { render } from 'tests';
import Pressable from './Pressable';
import Icon from 'components/Icon/Icon';
import Text from 'components/Text/Text';

describe('Pressable', () => {
  it('should render the pressable with text', () => {
    render(
      <Pressable onPress={() => {}}>
        <Text>Pressable</Text>
      </Pressable>,
    );
    expect(screen.getByText('Pressable')).toBeTruthy();
  });
  // it('should render the pressable with icon', () => {
  //   render(
  //     <Pressable onPress={() => {}}>
  //       <Icon icon="arrow-back-outline" />
  //     </Pressable>,
  //   );
  //   expect(screen.getByLabelText('arrow-back-outline')).toBeTruthy();
  // });
  // it('should render the pressable with custom style', () => {
  //   render(
  //     <Pressable onPress={() => {}} style={{ backgroundColor: 'yellow', padding: 8 }}>
  //       <Text>Pressable</Text>
  //     </Pressable>,
  //   );
  //   expect(screen.getByTestId('pressable')).toHaveStyle({ backgroundColor: 'yellow', padding: 8 });
  // });
});
