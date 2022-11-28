import { storiesOf } from '@storybook/react-native';
import React from 'react';
import ConversationFilter from './ConversationFilter';
import CenterView from 'components/StoryBookView';
import { action } from '@storybook/addon-actions';
import { useTheme } from '@react-navigation/native';

const ConversationAssigneeFilterStory = () => {
  const theme = useTheme();
  const { colors } = theme;
  const items = [
    {
      key: 'mine',
      name: 'Mine',
    },
    {
      key: 'unassigned',
      name: 'Unassigned',
    },
    {
      key: 'all',
      name: 'All',
    },
  ];
  return (
    <ConversationFilter
      title="Filter by assignee type"
      colors={colors}
      activeValue="unassigned"
      items={items}
      closeFilter={action('closed')}
      onChangeFilter={action('changed')}
    />
  );
};
const ConversationStatusFilterStory = () => {
  const theme = useTheme();
  const { colors } = theme;
  const items = [
    {
      key: 'open',
      name: 'Open',
    },
    {
      key: 'resolved',
      name: 'Resolved',
    },
    {
      key: 'pending',
      name: 'Pending',
    },
    {
      key: 'snoozed',
      name: 'Snoozed',
    },
    {
      key: 'all',
      name: 'All',
    },
  ];
  return (
    <ConversationFilter
      title="Filter by status type"
      colors={colors}
      activeValue="resolved"
      items={items}
      closeFilter={action('closed')}
      onChangeFilter={action('changed')}
    />
  );
};
storiesOf('Conversation Filter', module)
  .addDecorator(getStory => <CenterView>{getStory()}</CenterView>)
  .add('Conversation Status', () => <ConversationStatusFilterStory />)
  .add('Conversation Assignee', () => <ConversationAssigneeFilterStory />);
