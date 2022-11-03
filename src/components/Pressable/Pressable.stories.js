import { storiesOf } from '@storybook/react-native';
import React from 'react';
import Pressable from './Pressable';
import Icon from 'components/Icon/Icon';
import Text from 'components/Text/Text';
import { action } from '@storybook/addon-actions';
import CenterView from 'components/StoryBookView';

storiesOf('Pressable', module)
  .addDecorator(getStory => <CenterView>{getStory()}</CenterView>)
  .add('onClick pressable', () => (
    <Pressable onPress={action('pressed')}>
      <Text>Pressable</Text>
    </Pressable>
  ))
  .add('with custom style', () => (
    <Pressable onPress={action('pressed')} style={{ backgroundColor: 'yellow', padding: 8 }}>
      <Text>Pressable</Text>
    </Pressable>
  ))
  .add('with custom style and children', () => (
    <Pressable onPress={action('pressed')} style={{ backgroundColor: 'black', padding: 8 }}>
      <Icon icon="arrow-back-outline" />
    </Pressable>
  ));
