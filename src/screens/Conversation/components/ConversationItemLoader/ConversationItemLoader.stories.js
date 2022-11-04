import { storiesOf } from '@storybook/react-native';
import React from 'react';
import ConversationItemLoader from './ConversationItemLoader';
import CenterView from 'components/StoryBookView';

storiesOf('Conversation list loader', module)
  .addDecorator(getStory => <CenterView>{getStory()}</CenterView>)
  .add('loading view', () => <ConversationItemLoader />);
