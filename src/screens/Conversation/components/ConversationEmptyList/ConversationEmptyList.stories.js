import { storiesOf } from '@storybook/react-native';
import React from 'react';
import ConversationEmptyList from './ConversationEmptyList';
import CenterView from 'components/StoryBookView';

storiesOf('Conversation empty list', module)
  .addDecorator(getStory => <CenterView>{getStory()}</CenterView>)
  .add('loading view', () => <ConversationEmptyList />);
