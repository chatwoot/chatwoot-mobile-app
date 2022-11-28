import { storiesOf } from '@storybook/react-native';
import React from 'react';
import ConversationInboxFilter from './ConversationInboxFilter';
import CenterView from 'components/StoryBookView';
import { action } from '@storybook/addon-actions';
import { useTheme } from '@react-navigation/native';

const ConversationInboxFilterStory = () => {
  const theme = useTheme();
  const { colors } = theme;
  const items = [
    {
      id: 100,
      avatar_url: '',
      channel_id: 1,
      name: 'Twitter channel',
      channel_type: 'Channel::TwitterProfile',
      tweets_enabled: true,
      reply_time: null,
      messaging_service_sid: null,
      phone_number: null,
    },
    {
      id: 101,
      avatar_url: '',
      channel_id: 2,
      name: 'Telegram channel',
      channel_type: 'Channel::Telegram',
      tweets_enabled: true,
      reply_time: null,
      messaging_service_sid: null,
      phone_number: null,
    },
    {
      id: 102,
      avatar_url: '',
      channel_id: 3,
      name: 'Website channel',
      channel_type: 'Channel::WebWidget',
      tweets_enabled: true,
      reply_time: null,
      messaging_service_sid: null,
      phone_number: null,
    },
    {
      id: 103,
      avatar_url: '',
      channel_id: 4,
      name: 'Whatsapp Twilio Channel',
      channel_type: 'Channel::TwilioSms',
      tweets_enabled: true,
      reply_time: null,
      messaging_service_sid: null,
      phone_number: 'whatsapp:+14123423455238886',
      medium: 'whatsapp',
    },
  ];
  return (
    <ConversationInboxFilter
      title="Filter by assignee type"
      colors={colors}
      activeValue={102}
      hasLeftIcon
      items={items}
      closeFilter={action('closed')}
      onChangeFilter={action('changed')}
    />
  );
};

storiesOf('Conversation Inbox Filter', module)
  .addDecorator(getStory => <CenterView>{getStory()}</CenterView>)
  .add('Conversation Inbox', () => <ConversationInboxFilterStory />);
