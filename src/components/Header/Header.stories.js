import { View } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import React from 'react';
import Header from './Header';
import { action } from '@storybook/addon-actions';

storiesOf('Header', module)
  .addDecorator(getStory => <View>{getStory()}</View>)
  .add('with left icon', () => (
    <Header headerText="Header" leftIcon="arrow-left" onPressLeft={action('onPressLeft')} />
  ))
  .add('with right icon', () => (
    <Header headerText="Header" rightIcon="arrow-right" onPressRight={action('onPressRight')} />
  ));
