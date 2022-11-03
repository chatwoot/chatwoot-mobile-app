import { storiesOf } from '@storybook/react-native';
import { View } from 'react-native';
import React from 'react';
import Icon from './Icon';
import CenterView from 'components/StoryBookView';

storiesOf('Icon', module)
  .addDecorator(getStory => <CenterView>{getStory()}</CenterView>)
  .add('default icon', () => (
    <View>
      <Icon icon="options-outline" />
    </View>
  ))
  .add('with font size 48', () => (
    <View>
      <Icon icon="options-outline" size="48" />
    </View>
  ))
  .add('with color red', () => (
    <View>
      <Icon icon="options-outline" color="red" />
    </View>
  ));
