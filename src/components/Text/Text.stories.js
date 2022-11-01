import { View } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import React from 'react';
import Text from './Text';
import CenterView from 'components/StoryBookView';

storiesOf('Text', module)
  .addDecorator(getStory => <CenterView>{getStory()}</CenterView>)
  .add('with font size', () => (
    <View>
      <Text xxs>xxs</Text>
      <Text xs>xs</Text>
      <Text sm>sm</Text>
      <Text md>md</Text>
      <Text lg>lg</Text>
      <Text xl>xl</Text>
      <Text xxl>xxl</Text>
      <Text xxxl>xxxl</Text>
    </View>
  ))
  .add('with font weight', () => (
    <View>
      <Text thin>thin</Text>
      <Text ultraLight>ultraLight</Text>
      <Text light>light</Text>
      <Text regular>regular</Text>
      <Text medium>medium</Text>
      <Text semiBold>semiBold</Text>
      <Text bold>bold</Text>
      <Text heavy>heavy</Text>
      <Text normal>normal</Text>
    </View>
  ));
