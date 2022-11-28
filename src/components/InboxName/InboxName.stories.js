import { storiesOf } from '@storybook/react-native';
import React from 'react';
import InboxName from './InboxName';
import CenterView from 'components/StoryBookView';

storiesOf('Inbox name', module)
  .addDecorator(getStory => <CenterView>{getStory()}</CenterView>)
  .add('with icon', () => <InboxName inboxName="Widget app" />);
