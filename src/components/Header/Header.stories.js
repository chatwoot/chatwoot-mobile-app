import { storiesOf } from '@storybook/react-native';
import React from 'react';
import Header from './Header';
import { action } from '@storybook/addon-actions';
import CenterView from 'components/StoryBookView';

storiesOf('Header', module)
  .addDecorator(getStory => <CenterView>{getStory()}</CenterView>)
  .add('with left icon', () => (
    <Header headerText="Header" leftIcon="arrow-back-outline" onPressLeft={action('onPressLeft')} />
  ))
  .add('with right icon', () => (
    <Header
      headerText="Header"
      rightIcon="more-vertical-outline"
      onPressRight={action('onPressRight')}
    />
  ))
  .add('with loading view', () => <Header headerText="Updating" loading />);
