import { storiesOf } from '@storybook/react-native';
import React from 'react';
import ConversationEmptyItem from './ConversationEmptyItem';
import CenterView from 'components/StoryBookView';

storiesOf('Conversation empty item', module)
  .addDecorator(getStory => <CenterView>{getStory()}</CenterView>)
  .add('loading view', () => <ConversationEmptyItem />);
