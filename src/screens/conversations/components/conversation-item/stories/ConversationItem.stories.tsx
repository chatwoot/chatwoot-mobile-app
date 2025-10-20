import { Meta, StoryObj } from '@storybook/react';
import { ConversationItem, ConversationItemProps } from '../ConversationItem';
import {
  conversation,
  conversationWithLabelAndSLA,
  conversationWithAgentAndUnreadCount,
  conversationWithOneLineMessage,
  conversationWithAttachment,
  conversationWithOutgoingMessage,
  conversationWithNonEnglishContact,
  conversationWithMoreLabels,
  conversationWithAllFields,
  conversationWithMarkdownMessage,
  conversationWithNewLineMessage,
} from './ConversationItemMockData';
import { Text, ScrollView, View } from 'react-native';
import { tailwind } from '@/theme';

const meta: Meta<typeof ConversationItem> = {
  title: 'Conversation Item',
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

const Title = ({ title }: { title: string }) => (
  <View style={tailwind.style('flex items-center justify-center')}>
    <Text style={tailwind.style('text-md font-medium italic text-gray-800')}>{title}</Text>
  </View>
);

export const AllVariants: Story = {
  render: () => (
    <ScrollView
      contentContainerStyle={tailwind.style('flex flex-col justify-center items-center gap-2')}>
      <Title title="Conversation with all fields" />
      <ConversationItem
        {...conversationWithAllFields}
        isSelected={false}
        unreadCount={2}
        availabilityStatus="offline"
        inboxId={1}
        senderName="Floyd Alexander Milesmorrales"
        assignee={{
          id: 1,
          name: 'John Doe',
        }}
        currentState="none"
      />
      <Title title="Conversation with more labels" />
      <ConversationItem
        {...conversationWithMoreLabels}
        isSelected={false}
        unreadCount={2}
        availabilityStatus="offline"
        inboxId={1}
        senderName="Floyd Alexander Milesmorrales"
        assignee={{
          id: 1,
          name: 'John Doe',
        }}
        currentState="none"
      />
      <Title title="Conversation with one line message" />
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
      <Title title="Conversation with attachment" />
      {/* @ts-expect-error - TODO: fix this */}
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
      <Title title="Conversation with non-English contact" />
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
      <Title title="Conversation with labels" />
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
      <Title title="Conversation with assigned agent" />
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

      <Title title="Conversation with label and SLA" />
      <ConversationItem
        {...conversationWithLabelAndSLA}
        isSelected={false}
        unreadCount={0}
        availabilityStatus="online"
        inboxId={1}
        assignee={null}
        currentState="none"
      />
      <Title title="Conversation with agent and unread count" />
      <ConversationItem
        {...conversationWithAgentAndUnreadCount}
        isSelected={false}
        availabilityStatus="online"
        inboxId={1}
        currentState="none"
      />
      <Title title="Conversation with markdown message" />
      <ConversationItem
        {...conversationWithMarkdownMessage}
        isSelected={false}
        currentState="none"
        unreadCount={1}
        availabilityStatus="online"
        inboxId={1}
        assignee={null}
      />
      <Title title="Conversation with new line message" />
      <ConversationItem
        {...conversationWithNewLineMessage}
        isSelected={false}
        currentState="none"
        unreadCount={1}
        availabilityStatus="online"
        inboxId={1}
        assignee={{
          id: 1,
          name: 'John Doe',
        }}
      />
    </ScrollView>
  ),
};
