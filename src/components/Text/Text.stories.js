import { View } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import React from 'react';
import Text from './Text';
import CenterView from 'components/StoryBookView';

storiesOf('Text', module)
  .addDecorator(getStory => <CenterView>{getStory()}</CenterView>)
  .add('with font size', () => (
    <View>
      <Text accessible={true} xxs>
        xxs
      </Text>
      <Text accessible={true} xs>
        xs
      </Text>
      <Text accessible={true} sm>
        sm
      </Text>
      <Text accessible={true} md>
        md
      </Text>
      <Text accessible={true} lg>
        lg
      </Text>
      <Text accessible={true} xl>
        xl
      </Text>
      <Text accessible={true} xxl>
        xxl
      </Text>
      <Text accessible={true} xxxl>
        xxxl
      </Text>
    </View>
  ))
  .add('with font weight', () => (
    <View>
      <Text accessible={true} thin>
        thin
      </Text>
      <Text accessible={true} ultraLight>
        ultraLight
      </Text>
      <Text accessible={true} light>
        light
      </Text>
      <Text accessible={true} regular>
        regular
      </Text>
      <Text accessible={true} medium>
        medium
      </Text>
      <Text accessible={true} semiBold>
        semiBold
      </Text>
      <Text accessible={true} bold>
        bold
      </Text>
      <Text accessible={true} heavy>
        heavy
      </Text>
      <Text accessible={true} normal>
        normal
      </Text>
    </View>
  ));
