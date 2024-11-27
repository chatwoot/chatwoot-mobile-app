import { Meta, StoryObj } from '@storybook/react';
import { ConversationItem, ConversationItemProps } from '../ConversationItem';
import {
  conversation,
  conversationWithLabelAndSLA,
  conversationWithSLA,
  conversationWithAgentAndUnreadCount,
  conversationWithOneLineMessage,
  conversationWithAttachment,
  conversationWithOutgoingMessage,
  conversationWithNonEnglishContact,
} from './ConversationItemMockData';
import { Text, ScrollView } from 'react-native';
import { tailwind } from '@/theme';

const meta: Meta<typeof ConversationItem> = {
  title: 'ConversationItem',
  component: ConversationItem,
  argTypes: {
    currentState: {
      control: 'select',
      options: ['none', 'Select'],
      defaultValue: 'none',
    },
    isSelected: {
      control: 'boolean',
      defaultValue: false,
    },
    availabilityStatus: {
      control: 'select',
      options: ['online', 'offline', 'typing'],
      defaultValue: 'offline',
    },
    priority: {
      control: 'select',
      options: ['low', 'medium', 'high', 'urgent', null],
      defaultValue: 'medium',
    },
    unreadCount: {
      control: 'number',
      defaultValue: 1,
    },
  },
};

export default meta;
type Story = StoryObj<ConversationItemProps>;

export const Basic: Story = {
  args: {
    ...conversation,
    isSelected: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <ScrollView
      contentContainerStyle={tailwind.style('flex flex-col justify-center items-center gap-2')}>
      <Text>Conversation with one line message</Text>
      <ConversationItem
        {...conversationWithOneLineMessage}
        isSelected={false}
        unreadCount={2}
        availabilityStatus="offline"
        inboxId={1}
        assignee={{
          id: 1,
          name: 'John Doe',
        }}
        currentState="none"
      />
      <Text>Conversation last outgoing message</Text>
      <ConversationItem
        {...conversationWithOutgoingMessage}
        isSelected={false}
        availabilityStatus="online"
        inboxId={1}
        currentState="none"
        unreadCount={1}
        assignee={null}
      />
      <Text>Conversation with attachment</Text>
      <ConversationItem
        {...conversationWithAttachment}
        isSelected={false}
        availabilityStatus="online"
        inboxId={1}
        currentState="none"
        unreadCount={1}
        assignee={{
          id: 1,
          name: 'John Doe',
        }}
      />
      <Text>Conversation with non-English contact</Text>
      <ConversationItem
        {...conversationWithNonEnglishContact}
        isSelected={false}
        availabilityStatus="online"
        inboxId={1}
        currentState="none"
        unreadCount={10}
        assignee={{
          id: 1,
          name: 'John Doe',
        }}
      />
      <Text>Conversation with labels</Text>
      <ConversationItem
        {...conversation}
        isSelected={false}
        labels={['billing', 'lead']}
        unreadCount={2}
        availabilityStatus="offline"
        inboxId={1}
        assignee={null}
        currentState="none"
      />
      <Text>Conversation with assigned agent</Text>
      <ConversationItem
        {...conversation}
        isSelected={false}
        assignee={{
          id: 1,
          name: 'John Doe',
        }}
        unreadCount={3}
        availabilityStatus="offline"
        inboxId={1}
        currentState="none"
      />

      <Text>Conversation with SLA</Text>
      <ConversationItem
        {...conversationWithSLA}
        isSelected={false}
        unreadCount={1}
        availabilityStatus="typing"
        inboxId={1}
        assignee={null}
        currentState="none"
      />
      <Text>Conversation with label and SLA</Text>
      <ConversationItem
        {...conversationWithLabelAndSLA}
        isSelected={false}
        unreadCount={0}
        availabilityStatus="online"
        inboxId={1}
        assignee={null}
        currentState="none"
      />
      <Text>Conversation with agent and unread count</Text>
      <ConversationItem
        {...conversationWithAgentAndUnreadCount}
        isSelected={false}
        availabilityStatus="online"
        inboxId={1}
        currentState="none"
      />
    </ScrollView>
  ),
};
