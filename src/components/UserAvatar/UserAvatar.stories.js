import { storiesOf } from '@storybook/react-native';
import { View } from 'react-native';
import React from 'react';
import UserAvatar from './UserAvatar';
import CenterView from 'components/StoryBookView';

const inboxDetails = {
  id: 201,
  avatar_url: '',
  channel_id: 61,
  name: 'SMS',
  channel_type: 'Channel::TwilioSms',
  working_hours: [],
  phone_number: '+1540562255179',
  medium: 'sms',
};

const additionalAttributes = {
  from_state: null,
  from_country: null,
  from_zip_code: null,
};

storiesOf('User Avatar', module)
  .addDecorator(getStory => <CenterView>{getStory()}</CenterView>)
  .add('default view', () => (
    <View>
      <UserAvatar userName="John Doe" />
    </View>
  ))
  .add('default view with availability status', () => (
    <View>
      <UserAvatar userName="John Doe" availabilityStatus="busy" />
    </View>
  ))
  .add('default view with thumbnail image and size', () => (
    <View>
      <UserAvatar
        size={60}
        thumbnail="https://randomuser.me/api/portraits/men/18.jpg"
        userName="John Doe"
        availabilityStatus="online"
      />
    </View>
  ))
  .add('default view inbox badge', () => (
    <View>
      <UserAvatar
        userName="John Doe"
        size={60}
        channel={inboxDetails.channel_type}
        inboxInfo={inboxDetails}
        chatAdditionalInfo={additionalAttributes}
      />
    </View>
  ));
