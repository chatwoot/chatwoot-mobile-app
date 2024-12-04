import { Meta } from '@storybook/react';
import { InboxItem } from '../InboxItem';
import { ScrollView, View, Text } from 'react-native';
import { tailwind } from '@/theme';
import { NotificationType } from '@/types/Notification';
import { CONVERSATION_PRIORITY } from '@/constants';
import { conversation } from './NotificationItemMockData';
import { ConversationPriority } from '@/types/common';

const meta: Meta<typeof InboxItem> = {
  title: 'Inbox Item',
  component: InboxItem,
  argTypes: {
    isRead: {
      control: 'boolean',
      defaultValue: false,
    },
    priority: {
      control: 'select',
      options: ['low', 'medium', 'high', 'urgent', null],
      defaultValue: 'medium',
    },
    notificationType: {
      control: 'select',
      options: [
        'conversation_creation',
        'conversation_assignment',
        'assigned_conversation_new_message',
      ],
      defaultValue: 'conversation_creation',
    },
  },
};

export default meta;

const baseInboxItem = {
  conversationId: 123,
  sender: {
    name: 'John Doe',
    thumbnail: 'https://i.pravatar.cc/300?u=1',
  },
  assignee: {
    name: 'Agent Smith',
    thumbnail: 'https://i.pravatar.cc/300',
  },
  lastActivityAt: () => '2 hours ago',
  inbox: conversation.inbox,
  additionalAttributes: {},
  pushMessageTitle: 'This is a sample message from the customer',
  notificationType: 'conversation_creation' as NotificationType,
  isRead: false,
};

const Title = ({ title }: { title: string }) => (
  <View style={tailwind.style('flex items-center justify-center')}>
    <Text style={tailwind.style('text-md font-medium italic text-gray-800')}>{title}</Text>
  </View>
);

export const Basic = {
  args: {
    ...baseInboxItem,
    isRead: false,
  },
};

export const AllVariants = {
  render: () => (
    <ScrollView contentContainerStyle={tailwind.style('flex flex-col gap-2')}>
      <Title title="Unread Inbox Item" />
      <InboxItem {...baseInboxItem} isRead={false} />

      <Title title="Read Inbox Item" />
      <InboxItem {...baseInboxItem} isRead={true} />

      <Title title="Assignment Notification" />
      <InboxItem
        {...baseInboxItem}
        notificationType="conversation_assignment"
        pushMessageTitle="Conversation assigned to Agent Smith"
      />

      <Title title="New Message Notification" />
      <InboxItem
        {...baseInboxItem}
        notificationType="assigned_conversation_new_message"
        pushMessageTitle="New message from customer: Hello, I need help!"
      />

      <Title title="Mention Notification" />
      <InboxItem
        {...baseInboxItem}
        notificationType="conversation_mention"
        pushMessageTitle="You were mentioned in the conversation"
      />

      <Title title="Without Assignee" />
      <InboxItem
        {...baseInboxItem}
        assignee={{
          name: '',
          thumbnail: '',
        }}
      />

      <Title title="Long Message" />
      <InboxItem
        {...baseInboxItem}
        pushMessageTitle="This is a very long message that should be truncated at some point because it's too long to display in a single line"
      />

      <Title title="Urgent Priority" />
      <InboxItem
        {...baseInboxItem}
        isRead={false}
        priority={CONVERSATION_PRIORITY.URGENT as ConversationPriority}
      />
    </ScrollView>
  ),
};
