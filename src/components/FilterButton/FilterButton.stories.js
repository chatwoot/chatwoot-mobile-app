import { storiesOf } from '@storybook/react-native';
import React from 'react';
import FilterButton from './FilterButton';
import { action } from '@storybook/addon-actions';
import CenterView from 'components/StoryBookView';

storiesOf('Filter button', module)
  .addDecorator(getStory => <CenterView>{getStory()}</CenterView>)
  .add('without active view', () => (
    <FilterButton label="Inbox" isActive={false} onPress={action('pressed')} />
  ))
  .add('with active view', () => (
    <FilterButton label="Inbox" isActive={true} onPress={action('pressed')} />
  ))
  .add('with left icon', () => (
    <FilterButton
      label="Inbox"
      isActive={false}
      hasLeftIcon={true}
      leftIconName="inbox-outline"
      onPress={action('pressed')}
    />
  ));
