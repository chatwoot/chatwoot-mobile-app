import { storiesOf } from '@storybook/react-native';
import React from 'react';
import Empty from './Empty';
import images from 'constants/images';
import CenterView from 'components/StoryBookView';

storiesOf('Empty View', module)
  .addDecorator(getStory => <CenterView>{getStory()}</CenterView>)
  .add('without image', () => <Empty title="There are no active conversations in this group." />)
  .add('with image and title', () => (
    <Empty
      image={images.emptyConversations}
      title="There are no active conversations in this group."
    />
  ))
  .add('with image and subtitle', () => (
    <Empty
      image={images.emptyConversations}
      subTitle="There are no active conversations in this group."
    />
  ));
