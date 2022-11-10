import { storiesOf } from '@storybook/react-native';
import React from 'react';
import Pressable from './Pressable';
import Icon from 'components/Icon/Icon';
import Text from 'components/Text/Text';
import { action } from '@storybook/addon-actions';
import CenterView from 'components/StoryBookView';
const styles = {
  backgroundColor: 'yellow',
  padding: 8,
};
storiesOf('Pressable', module)
  .addDecorator(getStory => <CenterView>{getStory()}</CenterView>)
  .add('onClick pressable', () => (
    <Pressable onPress={action('pressed')}>
      <Text>Pressable</Text>
    </Pressable>
  ))
  .add('with custom style', () => (
    <Pressable onPress={action('pressed')} style={styles}>
      <Text>Pressable</Text>
    </Pressable>
  ))
  .add('with custom style and children', () => (
    <Pressable onPress={action('pressed')} style={styles}>
      <Icon icon="chat-outline" />
    </Pressable>
  ));
